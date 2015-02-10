describe('HeaderCtrl', function(){

  beforeEach(module('mainApp'));

  it('There should be a dummy variable in header control', inject(function($controller) {
    var scope = {},
        ctrl = $controller('HeaderCtrl', {$scope:scope});

    expect(scope.dummy).toBe(5);
  }));

});
