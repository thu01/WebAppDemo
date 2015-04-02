'use strict';

///Controllers
var productsInfoApp = angular.module('productsInfoApp', ['angularUtils.directives.dirPagination']);

productsInfoApp.controller('productInfoCtrl',[
'$scope',
'productsInfoFactory',
function($scope, productsInfoFactory){
  $scope.products = [];
  //Pagination Display depends on both $scope.products and total items
  //$scope.totalProducts = 58;
  $scope.productsPerPage = 15;
  getProducts(1, $scope.productsPerPage);

  $scope.pagination = {
    current: 1
  };

  function getProducts(pageNumber, productsPerPage) {
    productsInfoFactory.getProductsInfo().then(function(response){
      console.log(response.data);
      //angular.copy(response.data, $scope.products);
      $scope.products = response.data;
    });
  };
}]);

///Factories
productsInfoApp.factory('productsInfoFactory', ['$http', function($http){
  var productsFactory = {};
  productsFactory.getProductsInfo = function() {
    return $http.get('/wsGetProductsInfo');
  };
  return productsFactory;
}]);

