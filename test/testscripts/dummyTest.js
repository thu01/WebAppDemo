describe('DummyCtrl', function(){

  beforeEach(module('mainApp'));

  it('There should be a dummy variable in header control', inject(function ($rootScope, $controller) {
    
    var scope = $rootScope.$new();
    ctrl = $controller('DummyCtrl', {$scope: scope});
    expect(scope.dummy).toBe(5);
  }));

});
