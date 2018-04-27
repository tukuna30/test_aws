module.exports = {
  apps: [{
    name: 'Test EC2 Server',
    script: './server.js'
  }],
  deploy: {
    production: {
      user: 'ec2-user',
      host: 'ec2-13-126-162-20.ap-south-1.compute.amazonaws.com',
      key: '~/Downloads/awsKey.pem',
      ref: 'origin/master',
      repo: 'https://github.com/tukuna30/test_aws.git',
      path: '/home/ec2-user/test_aws',
      'post-deploy': 'npm install && npm run build-prod && pm2 startOrRestart ecosystem.config.js'
    }
  }
}
