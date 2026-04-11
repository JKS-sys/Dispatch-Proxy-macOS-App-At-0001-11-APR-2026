#!/bin/bash
set -e

# If your services are named differently, change "Wi‑Fi" / "Ethernet"
networksetup -setsocksfirewallproxy "Wi-Fi" 127.0.0.1 1080
networksetup -setsocksfirewallproxystate "Wi-Fi" on

networksetup -setsocksfirewallproxy "Ethernet" 127.0.0.1 1080
networksetup -setsocksfirewallproxystate "Ethernet" on

echo "SOCKS5 enabled on Wi‑Fi and Ethernet"