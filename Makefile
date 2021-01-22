TAG ?= 0.0.1

.PHONY: mycroft-catala
mycroft-catala:
	docker build mycroft-catala -f mycroft-catala/Dockerfile -t mycroft-catala:latest
	
create-kind-cluster:
	kind create cluster --config k8s/cluster/cluster.yaml
	
use-kind-context:
	kubectl config use-context kind-kind 
	
setup-kind-cluster: use-kind-context
	kustomize build k8s/cluster/config | kubectl apply -f -

docker-build-frontend:
	docker build ./frontend -f frontend/Dockerfile -t assistent/ona-frontend:${TAG}
	
docker-build-backend:
	docker build ./backend -f backend/Dockerfile -t assistent/ona-backend:${TAG}
	
kind-load-frontend: docker-build-frontend
	kind load docker-image assistent/ona-frontend:${TAG}

kind-load-backend: docker-build-backend
	kind load docker-image assistent/ona-backend:${TAG}

kind-load-catotron:
	docker pull assistent/catotron-cpu:latest && kind load docker-image assistent/catotron-cpu:latest

kind-load-vosk:
	docker pull assistent/kaldi-catala:0.0.2 && kind load docker-image assistent/kaldi-catala:0.0.2

kind-load-images: kind-load-frontend kind-load-backend

deploy-components: use-kind-context
	kustomize build k8s/components | kubectl apply -f -

undeploy-components: use-kind-context
	kustomize build k8s/components | kubectl delete -f -