#!/bin/bash 
echo "{
  \"AWSEBDockerrunVersion\": \"1\",
  \"Image\": {
    \"Name\": \"434769076122.dkr.ecr.us-east-1.amazonaws.com/weather-ecr:latest\",
    \"Update\": \"true\"
  },
  \"Ports\": [
    {
      \"ContainerPort\": \"80\"
    }
  ]
}" > Dockerrun.aws.json