'use strict';

var contactApp = angular.module('contactApp', []);

mainApp.controller('contactCtrl', [
'$scope',
'$location',
function($scope, $location){
  $scope.sendMail = function() {
    var link = "mailto:me@example.com"
             + "?cc=myCCaddress@example.com"
             + "&subject=" + escape("This is my subject")
             + "&body=";
    ;

    window.location.href = link;
  }
}]);
