'use strict';

///Controllers
var productsInfoApp = angular.module('productsInfoApp', ['ngTable']);

productsInfoApp.controller('productInfoCtrl',[
'$scope',
'ngTableParams',
'productsInfoFactory',
function($scope, ngTableParams, productsInfoFactory){
  //console.log("productInfoCtrl");
  //$scope.productsInfo = productsInfoFactory.products;
  var data = productsInfoFactory.products;
  console.log("Info: length($scope.productsInfo)= " + data.length);
  $scope.ngTableProducts = new ngTableParams({
        page: 1,            // show first page
        count: 5           // count per page
    }, {
        total: data.length, // length of data
        getData: function($defer, params) {
            $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
}]);

///Factories
productsInfoApp.factory('productsInfoFactory', ['$http', function($http){
  var res = {
    products: []
  };
  res.getProductsInfo = function() {
    //console.log("http get products info");
    return $http.get('/productsinfo').success(function(data){
      angular.copy(data, res.products);
    });
  };
  return res;
}]);

