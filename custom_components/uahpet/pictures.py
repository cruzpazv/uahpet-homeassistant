"""Cat photos: picked/uploaded through the media browser, stored and served by the integration (as in Litter Cat Identifier).

They are served by an authenticated view; entities and notifications hand out signed URLs
(like camera and image entities do), so a photo is never reachable without a login.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from http import HTTPStatus
from pathlib import Path
import re
import shutil
import uuid

from aiohttp import web

from homeassistant.components import media_source
from homeassistant.components.http import HomeAssistantView
from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import DOMAIN

URL_PREFIX = f"/api/{DOMAIN}/picture"
LEGACY_PREFIX = f"/{DOMAIN}_pictures"  # up to 0.8.0: an unauthenticated static path (stored URLs still map)
SIZE = 512
SIGN_FOR = timedelta(days=2)  # lifetime of a signed URL
RESIGN_AFTER = timedelta(days=1)  # hand out a fresh one after this
REFRESH_EVERY = timedelta(hours=6)  # entities re-read their picture this often
_NAME = re.compile(r"^[0-9a-f]{12}\.jpg$")
_SIGNED = f"{DOMAIN}_signed_pictures"


class PictureError(Exception):
    """Raised with a translation key as message."""


def picture_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DOMAIN))


class PictureView(HomeAssistantView):
    """Serves the stored photos to logged-in users and signed URLs only."""

    url = URL_PREFIX + "/{name}"
    name = f"api:{DOMAIN}:picture"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass

    async def get(self, request: web.Request, name: str) -> web.StreamResponse:
        path = picture_dir(self.hass) / name
        if not _NAME.match(name) or not await self.hass.async_add_executor_job(path.is_file):
            return web.Response(status=HTTPStatus.NOT_FOUND)
        return web.FileResponse(path, headers={"Cache-Control": "private, max-age=86400"})


async def async_register_view(hass: HomeAssistant) -> None:
    folder = picture_dir(hass)
    await hass.async_add_executor_job(lambda: folder.mkdir(parents=True, exist_ok=True))
    hass.http.register_view(PictureView(hass))


def _process(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image, ImageOps  # bundled with Home Assistant (image_upload)
    except ImportError:  # pragma: no cover - fall back to a plain copy
        shutil.copyfile(src, dest)
        return
    try:
        with Image.open(src) as img:
            img = ImageOps.exif_transpose(img).convert("RGB")
            img = ImageOps.fit(img, (SIZE, SIZE), Image.Resampling.LANCZOS)
            img.save(dest, "JPEG", quality=85, optimize=True)
    except Exception as err:  # noqa: BLE001 - anything Pillow can't read
        raise PictureError("invalid_image") from err


async def async_store_picture(hass: HomeAssistant, media_content_id: str) -> str:
    """Copy a media-browser image into our folder (square, 512 px) and return its URL."""
    try:
        media = await media_source.async_resolve_media(hass, media_content_id, None)
    except Exception as err:  # noqa: BLE001
        raise PictureError("invalid_image") from err
    if media.path is None:
        raise PictureError("not_local")
    name = f"{uuid.uuid4().hex[:12]}.jpg"
    await hass.async_add_executor_job(_process, Path(media.path), picture_dir(hass) / name)
    return f"{URL_PREFIX}/{name}"


def _file_name(url: str | None) -> str | None:
    """File name behind one of our picture URLs (current or legacy form), if any."""
    for prefix in (URL_PREFIX, LEGACY_PREFIX):
        if url and url.startswith(prefix + "/"):
            name = url[len(prefix) + 1 :].split("?", 1)[0]
            return name if _NAME.match(name) else None
    return None


def owned_file(hass: HomeAssistant, url: str | None) -> Path | None:
    """Return the local file behind one of our picture URLs, if any."""
    name = _file_name(url)
    return picture_dir(hass) / name if name else None


@callback
def picture_url(hass: HomeAssistant, url: str | None) -> str | None:
    """The URL to hand out: our photos signed (cached a while, so states don't churn), anything else as typed."""
    name = _file_name(url)
    if name is None:
        return url
    path = f"{URL_PREFIX}/{name}"
    cache: dict[str, tuple[str, datetime]] = hass.data.setdefault(_SIGNED, {})
    now = dt_util.utcnow()
    hit = cache.get(path)
    if hit is None or now - hit[1] >= RESIGN_AFTER:
        hit = cache[path] = (async_sign_path(hass, path, SIGN_FOR, use_content_user=True), now)
    return hit[0]


async def async_delete_pictures(hass: HomeAssistant, urls: list[str | None]) -> None:
    files = [f for f in (owned_file(hass, u) for u in urls) if f]

    def _delete() -> None:
        for f in files:
            f.unlink(missing_ok=True)

    if files:
        await hass.async_add_executor_job(_delete)


async def async_copy_picture(hass: HomeAssistant, src: Path) -> str | None:
    """Copy an image file (e.g. a Litter Cat Identifier photo) into our folder; returns its URL."""
    if not await hass.async_add_executor_job(src.is_file):
        return None
    name = f"{uuid.uuid4().hex[:12]}.jpg"
    await hass.async_add_executor_job(shutil.copyfile, src, picture_dir(hass) / name)
    return f"{URL_PREFIX}/{name}"


def lci_picture_file(hass: HomeAssistant, url: str | None) -> Path | None:
    """The file behind a Litter Cat Identifier photo URL (any version), to copy it."""
    for prefix in ("/api/litter_cat_identifier/picture/", "/litter_cat_identifier_pictures/"):
        if url and url.startswith(prefix):
            name = url[len(prefix):].split("?", 1)[0]
            return Path(hass.config.path("litter_cat_identifier")) / name if _NAME.match(name) else None
    return None
