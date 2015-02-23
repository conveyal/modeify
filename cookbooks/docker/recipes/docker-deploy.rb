
include_recipe 'deploy'

node[:deploy].each do |application, deploy|

  if node[:opsworks][:instance][:layers].first != deploy[:environment_variables][:LAYER]
    Chef::Log.debug("Skipping deploy::docker application #{application} as it is not deployed to this layer")
    next
  end

  opsworks_deploy_dir do
    user deploy[:user]
    group deploy[:group]
    path deploy[:deploy_to]
  end

  opsworks_deploy do
    deploy_data deploy
    app application
  end

  bash "docker-cleanup" do
    user "root"
    code <<-EOH
      if docker ps | grep #{deploy[:application]};
      then
        docker stop #{deploy[:application]}
        sleep 5
        docker rm -f #{deploy[:application]}
        sleep 5
      fi
      if docker images | grep #{deploy[:application]};
      then
        docker rmi -f #{deploy[:application]}
      fi
    EOH
  end

  dockerenvs = " "
  deploy[:environment_variables].each do |key, value|
    dockerenvs=dockerenvs+" -e "+key+"="+value
  end

  bash "docker-run" do
    user "root"
    cwd "#{deploy[:deploy_to]}/current"
    code <<-EOH
      docker run #{dockerenvs} \
        --volume $(pwd):/var/otp/graphs \
        --publish #{node[:opsworks][:instance][:private_ip]}:#{deploy[:environment_variables][:SERVICE_PORT]}:#{deploy[:environment_variables][:CONTAINER_PORT]} \
        --name #{deploy[:application]} \
        --detach=true \
        #{deploy[:application]} \
        --server
    EOH
  end
end