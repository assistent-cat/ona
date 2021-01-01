.PHONY: mycroft-catala
mycroft-catala:
	docker build mycroft-catala -f mycroft-catala/Dockerfile -t mycroft-catala:latest