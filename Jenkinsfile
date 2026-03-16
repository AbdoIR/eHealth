pipeline {
  agent any

  environment {
    DOCKER_USER = "abdoir192" 
    IMAGE_NAME  = "meddesk"
  }

  stages {
    stage('1. Build Docker Image') {
      steps {
        script {
          myImage = docker.build("${DOCKER_USER}/${IMAGE_NAME}:${env.BUILD_NUMBER}", "./Frontend")
        }
      }
    }

    stage('2. Push to Docker Hub') {
      steps {
        script {
          docker.withRegistry('', 'docker-hub-creds') {
            myImage.push()
            myImage.push("latest")
          }
        }
      }
    }

    stage('3. Deploy to Kubernetes') {
      steps {
        script {
          sh 'kubectl apply -f k8s/deployment.yml'
          sh 'kubectl rollout restart deployment/meddesk-ui'
        }
      }
    }
  }
}