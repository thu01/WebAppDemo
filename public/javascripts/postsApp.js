'use strict';

var postsApp = angular.module('postsApp', [
                                            'ui.router',
                                            'angularUtils.directives.dirPagination',
]);

//Controler for review page
postsApp.controller('postsCtrl',[
'$scope',
'postsFactory',
'$rootScope',
'$state',
'$filter',
function($scope, postsFactory, $rootScope, $state, $filter){
  $scope.posts = [];
  $scope.totalPosts = 0;
  $scope.postsPerPage = 10;
  getPosts(1, $scope.postsPerPage);

  //TODO: seems like this variable is useless
  $scope.pagination = {
    current: 1
  };

  $scope.pageChanged = function(newPage) {
        getPosts(newPage, $scope.postsPerPage);
      };

  function getPosts(pageNumber, postsPerPage) {
    postsFactory.getPostsCount().then(function(response){
      $scope.totalPosts = response.data;
    });
    postsFactory.getPostsPerPage(pageNumber, postsPerPage).then(function(response){
      $scope.posts = response.data;
    });
  };

  $scope.addPost = function()
  {
    if($scope.title === '')
    { 
      return; 
    }
    console.log("Add Post");
    var today = new Date();
    var postDate = $filter('date')(today, 'MM/dd/yyyy');
    var postTime = $filter('date')(today, 'mediumTime');
    var postAuthor = $rootScope.currentUser?$rootScope.currentUser.user_name: 'anonymous';
    postsFactory.createPost({
      post_author: postAuthor,
      post_date: postDate,
      post_date_time: postTime,
      post_content: $scope.title
      }).then(function(response){
        console.log("succeed");
        $scope.posts.push(response.data);
      });
    //Reload current page
    $state.go($state.current, {}, {reload: true});
  };
}]);

postsApp.factory('postsFactory', ['$http', function($http){
  var factory = {};
  factory.getPostsPerPage = function(pageNumber, postsPerPage){
    var postData = {
      "Page": pageNumber,
      "PostsPerPage": postsPerPage
    };
    return $http.post('/wsGetPosts', postData);
  };

  factory.getPostsCount = function(){
    return $http.get('/wsGetPostsCount');
  }

  factory.createPost = function(post) {
    return $http.post('/wsCreatePost', post);
  };
  return factory;
}]);