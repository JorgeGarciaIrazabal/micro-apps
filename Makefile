.PHONY: opencode omp build kill-port serve dev claude claude-ollama claude-qwen

opencode:
	ollama launch opencode --model micro-apps-glm --yes

omp:
	omp

build:
	@echo "Building all micro apps..."
	@for app in apps/*; do \
		if [ -d "$$app" ]; then \
			echo "----------------------------------------"; \
			echo "Building $$app..."; \
			echo "----------------------------------------"; \
			(cd "$$app" && npm install && npm run build) || exit 1; \
			name=$$(basename "$$app"); \
			echo "Copying built files for $$name to root directory..."; \
			rm -rf "$$name"; \
			mkdir -p "$$name"; \
			cp -r "$$app/dist/"* "$$name/"; \
		fi; \
	done
	@echo "----------------------------------------"
	@echo "All apps built and copied successfully!"
	@echo "----------------------------------------"

kill-port:
	@echo "Clearing dev ports (8000 + 5173-5200) if in use..."
	@for p in 8000 $$(seq 5173 5200); do lsof -t -i:$$p | xargs kill -9 2>/dev/null || true; done

serve: build kill-port
	@echo "Creating self-referential symlink for asset mapping..."
	@ln -sfn . micro-apps
	@echo "Starting server. Open: http://localhost:8000/"
	python3 -m http.server 8000

dev: kill-port
	@echo "Starting dev server with hot reload. Open: http://localhost:8000/micro-apps/"
	node scripts/dev-server.js

claude:
	claude --dangerously-skip-permissions

claude-ollama:
	ANTHROPIC_BASE_URL="http://localhost:11434" \
	ANTHROPIC_AUTH_TOKEN="ollama" \
	ANTHROPIC_API_KEY="" \
	claude --model $${model:-glm-5.1:cloud} --dangerously-skip-permissions "$$@"

claude-qwen:
	ANTHROPIC_BASE_URL="http://localhost:1234/v1" \
	ANTHROPIC_API_KEY="not-needed" \
	claude --model qwen/qwen3.6-35b-a3b --dangerously-skip-permissions "$$@"