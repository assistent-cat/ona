TAG ?= 0.0.1

.PHONY: mycroft-catala
mycroft-catala:
	docker build mycroft-catala -f mycroft-catala/Dockerfile -t mycroft-catala:latest
	
create-kind-cluster:
	kind create cluster --config k8s/cluster/cluster.yaml
	
use-kind-context: create-kind-cluster
	kubectl config use-context kind-kind 

setup-kind-cluster: use-kind-context
	kubectl apply -f k8s/cluster/cert-manager.yaml -f k8s/cluster/ingress-nginx.yaml -f k8s/cluster/metrics-server.yaml

docker-build-frontend:
	docker build ./frontend -f frontend/Dockerfile -t assistent-cat/ona-frontend:${TAG}
	
docker-build-backend:
	docker build ./backend -f backend/Dockerfile -t assistent-cat/ona-backend:${TAG}
	
kind-load-frontend: docker-build-frontend
	kind load docker-image assistent-cat/ona-frontend:${TAG}

kind-load-backend: docker-build-backend
	kind load docker-image assistent-cat/ona-backend:${TAG}
	
kind-load-images: kind-load-frontend kind-load-backend

deploy-components:
	kustomize build k8s/components | kubectl apply -f -

undeploy-components:
	kustomize build k8s/components | kubectl delete -f -