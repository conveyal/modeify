
include_recipe 'deploy'

node[:deploy].each do |application, deploy|

  if node[:opsworks][:instance][:layers].first != deploy[:environment_variables][:layer]
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
        sleep 3
        docker rm #{deploy[:application]}
        sleep 3
      fi
      if docker images | grep #{deploy[:application]};
      then
        docker rmi #{deploy[:application]}
      fi
    EOH
  end

  bash "docker-build" do
    user "root"
    cwd "#{deploy[:deploy_to]}/current"
    code <<-EOH
     docker build -t=#{deploy[:application]} . > #{deploy[:application]}-docker.out
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
      docker run #{dockerenvs} -p #{node[:opsworks][:instance][:private_ip]}:#{deploy[:environment_variables][:service_port]}:#{deploy[:environment_variables][:container_port]} --name #{deploy[:application]} -d #{deploy[:application]}
    EOH
  end

end
