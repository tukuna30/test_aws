module.exports = {
  apps: [{
    name: 'Test EC2 Server',
    script: './index.js'
  }],
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-13-126-178-201.ap-south-1.compute.amazonaws.com',
      key: '~/.ssh/firstEC2.pem',
      ref: 'origin/master',
      repo: 'https://github.com/tukuna30/test_aws.git',
      path: '/home/ec2-user/test_aws',
      'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
