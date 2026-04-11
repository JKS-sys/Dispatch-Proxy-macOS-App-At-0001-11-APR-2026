#!/bin/bash
set -e

networksetup -setsocksfirewallproxystate "Wi-Fi" off
networksetup -setsocksfirewallproxystate "Ethernet" off

echo "SOCKS5 disabled on Wi‑Fi and Ethernet"