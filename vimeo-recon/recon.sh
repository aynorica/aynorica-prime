#!/bin/bash

# Vimeo Recon Script
# Targets: vimeo.com, vhx.tv

mkdir -p vimeo-recon/domains
mkdir -p vimeo-recon/live

echo "[+] Starting Subdomain Enumeration for vimeo.com..."
subfinder -d vimeo.com -silent -o vimeo-recon/domains/vimeo-subs.txt

echo "[+] Starting Subdomain Enumeration for vhx.tv..."
subfinder -d vhx.tv -silent -o vimeo-recon/domains/vhx-subs.txt

echo "[+] Merging lists..."
cat vimeo-recon/domains/vimeo-subs.txt vimeo-recon/domains/vhx-subs.txt | sort -u > vimeo-recon/domains/all-subs.txt

echo "[+] Probing for live hosts (HTTP/HTTPS)..."
cat vimeo-recon/domains/all-subs.txt | httpx -silent -title -tech-detect -status-code -o vimeo-recon/live/live-hosts.txt

echo "[+] Recon Complete. Results saved to vimeo-recon/live/live-hosts.txt"
