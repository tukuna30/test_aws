
ssh ec2-user@ec2-13-126-162-20.ap-south-1.compute.amazonaws.com

echo 'Getting latest changes'
cd ~/test_aws
git checkout --force master
git pull
echo "build code"
npm install 
npm run build-prod 
echo "deploy code"
pm2 startOrRestart ecosystem.config.js --env production

echo 'Done!'

EOF