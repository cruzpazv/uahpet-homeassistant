#!/usr/bin/env python3
"""Dump full DP schema of a Tuya device via Tuya Cloud OpenAPI (stdlib only).

Credentials (Tuya IoT Platform → Cloud → project → Overview):
  TUYA_ACCESS_ID, TUYA_ACCESS_SECRET  (env vars or --id / --secret)

Usage:
  tuya_schema.py --region eu                 # list linked devices
  tuya_schema.py --region eu --device <id>   # dump schema of one device

Output (in --out dir): info.json, model.json, specifications.json,
shadow.json, schema.md. info.json holds local_key → do not commit.
"""

import argparse
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

REGIONS = {
    "cn": "https://openapi.tuyacn.com",
    "us": "https://openapi.tuyaus.com",
    "us-e": "https://openapi-ueaz.tuyaus.com",
    "eu": "https://openapi.tuyaeu.com",
    "eu-w": "https://openapi-weaz.tuyaeu.com",
    "in": "https://openapi.tuyain.com",
    "sg": "https://openapi-sg.iotbing.com",
}


class TuyaCloud:
    def __init__(self, base, access_id, secret):
        self.base, self.id, self.secret = base, access_id, secret
        self.token = None
        self.token = self.get("/v1.0/token", {"grant_type": 1})["access_token"]

    def _sign(self, method, path_query, body, t):
        body_hash = hashlib.sha256(body).hexdigest()
        string_to_sign = f"{method}\n{body_hash}\n\n{path_query}"
        msg = self.id + (self.token or "") + t + string_to_sign
        return hmac.new(self.secret.encode(), msg.encode(), hashlib.sha256).hexdigest().upper()

    def get(self, path, query=None):
        if query:
            path += "?" + "&".join(f"{k}={v}" for k, v in sorted(query.items()))
        t = str(int(time.time() * 1000))
        headers = {
            "client_id": self.id,
            "t": t,
            "sign_method": "HMAC-SHA256",
            "sign": self._sign("GET", path, b"", t),
        }
        if self.token:
            headers["access_token"] = self.token
        req = urllib.request.Request(self.base + path, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.load(r)
        except urllib.error.HTTPError as e:
            sys.exit(f"HTTP {e.code} on {path}: {e.read().decode(errors='replace')}")
        if not data.get("success"):
            raise RuntimeError(f"{path}: code={data.get('code')} msg={data.get('msg')}")
        return data["result"]


def list_devices(api):
    rows, last = [], ""
    while True:
        q = {"size": 50}
        if last:
            q["last_row_key"] = last
        res = api.get("/v1.0/iot-01/associated-users/devices", q)
        rows += res.get("devices", [])
        if not res.get("has_more"):
            return rows
        last = res["last_row_key"]


def fmt_spec(spec):
    t = spec.get("type", "?")
    if t == "value":
        unit = spec.get("unit", "")
        scale = spec.get("scale", 0)
        return f"{spec.get('min')}..{spec.get('max')} step {spec.get('step')} scale {scale} {unit}".strip()
    if t == "enum":
        return ", ".join(map(str, spec.get("range", [])))
    if t == "bitmap":
        return "bits: " + ", ".join(map(str, spec.get("label", [])))
    if t in ("string", "raw"):
        return f"maxlen {spec.get('maxlen', '?')}"
    return ""


def safe(fn, *a):
    try:
        return fn(*a)
    except RuntimeError as e:
        print(f"  ! {e}", file=sys.stderr)
        return None


def dump(api, dev_id, out):
    os.makedirs(out, exist_ok=True)
    info = safe(api.get, f"/v1.0/devices/{dev_id}")
    model_raw = safe(api.get, f"/v2.0/cloud/thing/{dev_id}/model")
    specs = safe(api.get, f"/v1.0/devices/{dev_id}/specifications")
    shadow = safe(api.get, f"/v2.0/cloud/thing/{dev_id}/shadow/properties")

    if info is None and model_raw is None:
        sys.exit(
            f"No data for '{dev_id}'. --device must be the device id (1st column of the listing, ~22 chars), "
            "not the product id (3rd column, 16 chars)."
        )
    model = json.loads(model_raw["model"]) if model_raw and model_raw.get("model") else None
    for name, obj in [("info", info), ("model", model), ("specifications", specs), ("shadow", shadow)]:
        if obj is not None:
            path = os.path.join(out, f"{name}.json")
            with open(path, "w") as f:
                json.dump(obj, f, indent=2, ensure_ascii=False)
            if name == "info":
                os.chmod(path, 0o600)

    std_codes = set()
    if specs:
        std_codes = {x["code"] for x in specs.get("functions", []) + specs.get("status", [])}
    values = {p["code"]: p.get("value") for p in (shadow or {}).get("properties", [])}

    rows = []
    for svc in (model or {}).get("services", []):
        for p in svc.get("properties", []):
            spec = p.get("typeSpec", {})
            rows.append((
                p.get("abilityId"), p.get("code"), p.get("name", ""), spec.get("type", ""),
                p.get("accessMode", ""), fmt_spec(spec), values.get(p.get("code"), ""),
                "yes" if p.get("code") in std_codes else "**NO**",
            ))
    rows.sort(key=lambda r: (r[0] is None, r[0]))

    lines = [f"# DP schema: {(info or {}).get('name', dev_id)}", ""]
    if info:
        lines += [f"- category: `{info.get('category')}`", f"- product_id: `{info.get('product_id')}`",
                  f"- product_name: {info.get('product_name')}", f"- model: {info.get('model', '')}", ""]
    lines += ["| DP | code | name | type | mode | range | value | code in std set |",
              "|---:|---|---|---|---|---|---|---|"]
    lines += ["| " + " | ".join(str(c).replace("|", "\\|") for c in r) + " |" for r in rows]
    for svc in (model or {}).get("services", []):
        for kind in ("actions", "events"):
            if svc.get(kind):
                lines += ["", f"## {kind}", "```json", json.dumps(svc[kind], indent=2, ensure_ascii=False), "```"]
    md = "\n".join(lines) + "\n"
    with open(os.path.join(out, "schema.md"), "w") as f:
        f.write(md)
    print(md)
    hidden = sum(1 for r in rows if r[7] == "**NO**")
    print(f"{len(rows)} DPs, {hidden} with a code not in the standard set (it may still be there renamed, e.g. lock = child_lock). Files → {out}/ (info.json has local_key: keep private)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--region", default="eu", choices=REGIONS)
    ap.add_argument("--id", default=os.environ.get("TUYA_ACCESS_ID"))
    ap.add_argument("--secret", default=os.environ.get("TUYA_ACCESS_SECRET"))
    ap.add_argument("--device", help="device id; omit to list devices")
    ap.add_argument("--out", help="output dir (default tuya_dump_<device>)")
    a = ap.parse_args()
    if not a.id or not a.secret:
        ap.error("need --id/--secret or TUYA_ACCESS_ID/TUYA_ACCESS_SECRET")

    api = TuyaCloud(REGIONS[a.region], a.id, a.secret)
    if not a.device:
        for d in list_devices(api):
            print(f"{d['id']}  {d.get('category', ''):6}  {d.get('product_id', '')}  {d.get('name', '')}")
        return
    dump(api, a.device, a.out or f"tuya_dump_{a.device}")


if __name__ == "__main__":
    main()
