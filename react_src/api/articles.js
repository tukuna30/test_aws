class ArticlesApi {  
    static getAllArticles() {
      return new Promise(function(resolve, reject) {
        let response = [{id: 1, name: 'Ladakh', description: "<figure class='image image-style-align-left'><img src='https://s3.ap-south-1.amazonaws.com/test-bucket-tukuna/background1_low.jpg'></figure><h4>Picturesque Ladakh!!!</h4><p>Sometimes you like to be with nature. People are great but we do have internal solitary soul which needs moments to reflect. These reflections will help us to do more, feel and enjoy more about life, that is so beautiful.</p><p>&nbsp;</p><p>Let's plan for a road trip this July.&nbsp;</p>"}, 
        {id: 2, name: 'Ooty', description: "<h4><strong>Hill station</strong></h4><p>Ooty is one of the serene hill stations. At an elevation of 2,240 m from sea, you'll feel the chilling yet pleasant weather thru out the year.</p><p>&nbsp;</p><p>Are you planning a trip there this summer?</p><p>&nbsp;</p>"}, 
        {id: 3, name: 'Coonor', description: "<h4>Beautiful Coonoor</h4> Coonor is calm and beautiful!!! Sorrounded by Nilgiris throught, it's mesmerizing. You'll be glad to see the calm, green tea estates. &nbsp; &nbsp; Let's cycle there sooner."}];
        resolve(response);
      }).then(response => {
        return response;
      }).catch(error => {
        return error;
      });
    }
}
export default ArticlesApi;