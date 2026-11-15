#!/usr/bin/env python3
"""Static link and markup checker for Forge website."""

import os
import sys
import re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse

SITE_DIR = Path(__file__).resolve().parent.parent / "site"


class SiteHTMLParser(HTMLParser):
    def __init__(self, file_path):
        super().__init__()
        self.file_path = file_path
        self.errors = []
        self.warnings = []
        self.links = []
        self.images = []
        self.scripts = []
        self.stylesheets = []
        self.ids = set()
        self.has_doctype = False
        self.has_title = False
        self.has_meta_viewport = False
        self.has_meta_charset = False
        self.open_tags = []

    def handle_decl(self, decl):
        if decl.lower().startswith("doctype html"):
            self.has_doctype = True

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        self.open_tags.append(tag)

        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])

        if tag == "title":
            self.has_title = True
        elif tag == "meta":
            if "charset" in attr_dict:
                self.has_meta_charset = True
            if attr_dict.get("name") == "viewport":
                self.has_meta_viewport = True
        elif tag == "a":
            href = attr_dict.get("href")
            if href:
                self.links.append((href, self.getpos()))
        elif tag == "img":
            src = attr_dict.get("src")
            if src:
                self.images.append((src, self.getpos()))
            if "alt" not in attr_dict:
                self.warnings.append(f"Line {self.getpos()[0]}: <img> missing alt attribute: {src}")
        elif tag == "script":
            src = attr_dict.get("src")
            if src:
                self.scripts.append((src, self.getpos()))
        elif tag == "link":
            if attr_dict.get("rel") == "stylesheet":
                href = attr_dict.get("href")
                if href:
                    self.stylesheets.append((href, self.getpos()))

    def handle_endtag(self, tag):
        pass


def check_html_file(file_path):
    print(f"Checking {file_path.relative_to(SITE_DIR.parent)}...")
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    parser = SiteHTMLParser(file_path)
    parser.feed(content)

    errors = []

    if not parser.has_doctype:
        errors.append("Missing <!doctype html>")
    if not parser.has_title:
        errors.append("Missing <title> tag")
    if not parser.has_meta_charset:
        errors.append("Missing <meta charset>")
    if not parser.has_meta_viewport:
        errors.append("Missing <meta name='viewport'>")

    file_dir = file_path.parent

    # Check images
    for src, pos in parser.images:
        parsed = urlparse(src)
        if not parsed.scheme:  # Local file
            target = (file_dir / src).resolve()
            if not target.exists():
                errors.append(f"Line {pos[0]}: Image not found: {src} (resolved to {target})")

    # Check scripts
    for src, pos in parser.scripts:
        parsed = urlparse(src)
        if not parsed.scheme:
            target = (file_dir / src).resolve()
            if not target.exists():
                errors.append(f"Line {pos[0]}: Script not found: {src} (resolved to {target})")

    # Check stylesheets
    for href, pos in parser.stylesheets:
        parsed = urlparse(href)
        if not parsed.scheme:
            target = (file_dir / href).resolve()
            if not target.exists():
                errors.append(f"Line {pos[0]}: Stylesheet not found: {href} (resolved to {target})")

    # Check links
    for href, pos in parser.links:
        if href.startswith("#"):
            # Internal anchor in same file
            target_id = href[1:]
            if target_id and target_id not in parser.ids:
                errors.append(f"Line {pos[0]}: Anchor #{target_id} not found in {file_path.name}")
        elif not urlparse(href).scheme:
            # Local page link
            parts = href.split("#", 1)
            path_part = parts[0]
            target = (file_dir / path_part).resolve()
            if not (target.exists() or (target.is_dir() and (target / "index.html").exists())):
                # Also check with .html extension
                if not (file_dir / f"{path_part}.html").exists():
                    errors.append(f"Line {pos[0]}: Local link target not found: {href}")

    return errors, parser.warnings


def main():
    if not SITE_DIR.exists():
        print(f"Error: Site directory does not exist at {SITE_DIR}")
        sys.exit(1)

    html_files = list(SITE_DIR.glob("**/*.html"))
    if not html_files:
        print("Error: No HTML files found in site directory")
        sys.exit(1)

    all_errors = []
    total_warnings = 0

    for html_file in html_files:
        errors, warnings = check_html_file(html_file)
        for w in warnings:
            print(f"  [WARN] {w}")
            total_warnings += 1
        for e in errors:
            print(f"  [ERROR] {e}")
            all_errors.append((html_file, e))

    print("-" * 50)
    print(f"Scanned {len(html_files)} HTML files: {len(all_errors)} errors, {total_warnings} warnings.")

    if all_errors:
        print("Site check FAILED.")
        sys.exit(1)
    else:
        print("Site check PASSED.")


if __name__ == "__main__":
    main()
