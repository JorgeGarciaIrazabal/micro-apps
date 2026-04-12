.PHONY: opencode serve claude claude-ollama

opencode:
	ollama run opencode --model glm-5.1:cloud

serve:
	cd .. && python3 -m http.server 8000

claude:
	claude --dangerously-skip-permissions

claude-ollama:
	ANTHROPIC_BASE_URL="http://localhost:11434" \
	ANTHROPIC_AUTH_TOKEN="ollama" \
	ANTHROPIC_API_KEY="" \
	claude --model $${model:-glm-5.1:cloud} --dangerously-skip-permissions "$$@"