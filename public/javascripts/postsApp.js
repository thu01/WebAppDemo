'use strict';

var postsApp = angular.module('postsApp', []);

//Controler for review page
postsApp.controller('postsCtrl',[
'$scope',
'postsFactory',
'$rootScope',
function($scope, postsFactory, $rootScope){
	$scope.posts = postsFactory.posts;
    //TODO: Use session data for user name
  $scope.addPost = function(){
      if($scope.title === '') { return; }
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      var hour = today.getHours();
      var minute = today.getMinutes();
      var second = today.getSeconds();
      if(dd<10) {
        dd='0'+dd
      }
      if(mm<10) {
        mm='0'+mm
      }
      postsFactory.createPost({
        post_author: (function () {
            if ($rootScope.currentUser) {
              return $rootScope.currentUser.user_name;
            } else { return 'anonymous' }})(),
        post_date: mm+'/'+dd+'/'+yyyy,
        post_date_time: hour+':'+minute+':'+second,
        post_content: $scope.title
      });
      location.reload();
    };
}]);

postsApp.factory('postsFactory', ['$http', function($http){
  var o = {
    posts: []
  };
  o.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, o.posts);
    });
  };
  o.createPost = function(post) {
  return $http.post('/posts', post).success(function(data){
    o.posts.push(data);
  });
};
  return o;
}]);