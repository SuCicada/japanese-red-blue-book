.PHONY: serve install clean

# Default port for the server
PORT = 8000

# Install live-server if not already installed
# Serve with live reload
serve:
	@echo "Starting live-server on http://localhost:$(PORT)"
	npx live-server --port=$(PORT) --no-browser

# Clean any generated files
