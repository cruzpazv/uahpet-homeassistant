"""Cat photos: picked/uploaded through the media browser, stored and served by the integration (as in Litter Cat Identifier)."""

from __future__ import annotations

from pathlib import Path
import shutil
import time
import uuid

from homeassistant.components import media_source
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN

URL_PREFIX = f"/{DOMAIN}_pictures"
SIZE = 512


class PictureError(Exception):
    """Raised with a translation key as message."""


def picture_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(DOMAIN))


async def async_register_static_path(hass: HomeAssistant) -> None:
    folder = picture_dir(hass)
    await hass.async_add_executor_job(lambda: folder.mkdir(parents=True, exist_ok=True))
    await hass.http.async_register_static_paths([StaticPathConfig(URL_PREFIX, str(folder), False)])


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
    return f"{URL_PREFIX}/{name}?v={int(time.time())}"


def owned_file(hass: HomeAssistant, url: str | None) -> Path | None:
    """Return the local file behind one of our picture URLs, if any."""
    if not url or not url.startswith(URL_PREFIX + "/"):
        return None
    name = url[len(URL_PREFIX) + 1 :].split("?", 1)[0]
    if "/" in name or name.startswith("."):
        return None
    return picture_dir(hass) / name


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
    return f"{URL_PREFIX}/{name}?v={int(time.time())}"
