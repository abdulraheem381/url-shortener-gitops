resource "kubernetes_namespace" "argocd" {
  metadata {
    name = "argocd"
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = kubernetes_namespace.argocd.metadata[0].name
  version    = "6.7.11" # Latest 2024/2025 stable

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "server.insecure"
    value = "true"
  }

  set {
    name  = "redis.enabled"
    value = "true"
  }

  set {
    name  = "redis-ha.enabled"
    value = "false"
  }

  set {
    name  = "server.persistence.enabled"
    value = "false"
  }

  set {
    name  = "repoServer.persistence.enabled"
    value = "false"
  }

  set {
    name  = "controller.persistence.enabled"
    value = "false"
  }

  set {
    name  = "redis.persistence.enabled"
    value = "false"
  }
}

# Bootstrapping the root application for GitOps
resource "kubectl_manifest" "argocd_root_app" {
  depends_on = [helm_release.argocd]
  yaml_body  = <<YAML
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-apps
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/abdulraheem381/url-shortener-gitops.git
    targetRevision: HEAD
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
YAML
}
