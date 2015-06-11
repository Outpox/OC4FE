angular.module('oc4fe', ['ngMaterial', 'ngRoute'])
    .factory('Data', function () {
        return {
            payeur: '',
            date: new Date()
        }
    })
    .factory('People', function () {
        var date1 = new Date();
        var date2 = new Date();
        date1.setDate(date1.getDate() - 1);
        date2.setDate(date2.getDate() - 5);

        return [
            {
                id: 1,
                prenom: 'Guillaume',
                img: 'guillaume.png',
                dernierCafe: new Date(),
                joursDepuisDernierCafe: 0,
                payeAjd: false,
                present: false,
                sucre: true,
                touillette: true,
                vacances: true
            },
            {
                id: 2,
                prenom: 'Dahyun',
                img: 'dahyun.png',
                dernierCafe: date1,
                joursDepuisDernierCafe: 0,
                payeAjd: false,
                present: false,
                sucre: true,
                touillette: true,
                vacances: false
            },
            {
                id: 3,
                prenom: 'Gerôme',
                img: 'gerome.png',
                dernierCafe: date2,
                joursDepuisDernierCafe: 0,
                payeAjd: false,
                present: false,
                sucre: true,
                touillette: true,
                vacances: false
            }
        ]
    })
    .controller('toolbarCtrl', ['$scope', '$location', 'People', 'Data', '$mdBottomSheet', function ($scope, $location, People, Data, $mdBottomSheet) {
        $scope.people = People;
        $scope.data = Data;
        $scope.index = function () {
            $location.path('/');
            $scope.data.payeur = {};
            for (var p in $scope.people) {
                $scope.people[p].present = false;
                $scope.people[p].payeAjd = false;
            }
        };
        $scope.showGridBottomSheet = function () {
            $mdBottomSheet.show({
                templateUrl: 'view/bottom-sheet-action.html',
                controller: 'menuCtrl'
            });
        };
    }])
    .controller('menuCtrl', ['$scope', '$location', '$mdBottomSheet', function ($scope, $location, $mdBottomSheet) {
        $scope.addNewUser = function () {
            $mdBottomSheet.hide();
            $location.path('/newuser');
        };
        $scope.editUser = function () {
            $mdBottomSheet.hide();
            $location.path('/userlist');
        }
    }])
    .controller('listCtrl', ['$scope', '$location', 'People', 'Data', function ($scope, $location, People, Data) {
        function dateDiff(date1, date2) {
            var diff = {};                    // Initialisation du retour
            var tmp = date2 - date1;
            tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
            diff.sec = tmp % 60;                    // Extraction du nombre de secondes
            tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
            diff.min = tmp % 60;                    // Extraction du nombre de minutes
            tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
            diff.hour = tmp % 24;                   // Extraction du nombre d'heures
            tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
            diff.day = tmp;
            return diff.day;
        }

        $scope.people = People;
        $scope.Data = Data;

        $scope.presents = function (person) {
            if (person.vacances) return;
            person.payeAjd = true;
            person.present = true;
            $scope.Data.payeur = person;
            $location.path('/presents');
        };

        for (var p in $scope.people) {
            $scope.people[p].joursDepuisDernierCafe = dateDiff($scope.people[p].dernierCafe, new Date());
        }
    }])
    .controller('presentsCtrl', ['$scope', '$location', 'People', 'Data', function ($scope, $location, People, Data) {
        $scope.people = People;
        $scope.data = Data;
        $scope.goToSucre = function () {
            $location.path('/sucre');
        }
    }])
    .controller('sucreCtrl', ['$scope', 'People', 'Data', function ($scope, People, Data) {
        $scope.people = People;
        $scope.data = Data;
        $scope.data.payeur.dernierCafe = new Date();
        $scope.qteSucre = $scope.qteCafe = $scope.qteTouillette = 0;
        for (var p in $scope.people) {
            if ($scope.people[p].sucre && $scope.people[p].present)
                $scope.qteSucre++;
            if ($scope.people[p].touillette && $scope.people[p].present)
                $scope.qteTouillette++;
            if ($scope.people[p].present)
                $scope.qteCafe++;
        }
    }])
    .controller('newUserCtrl', ['$scope', 'People', 'Data', '$location', function ($scope, People, Data, $location) {
        $scope.people = People;
        $scope.data = Data;
        var person = {};
        $scope.submit = function () {
            person.id = $scope.people.length + 1;
            person.prenom = $scope.prenom;
            person.img = '';
            person.dernierCafe = new Date();
            person.joursDepuisDernierCafe = 0;
            person.payeAjd = false;
            person.present = false;
            person.sucre = $scope.sucre;
            person.touillette = $scope.touillette;
            person.vacances = $scope.vacances;
            $scope.people.push(person);
            $location.path('/');
        }
    }])
    .controller('userListCtrl', ['$scope', 'People', 'Data', '$location', function ($scope, People, Data, $location) {
        $scope.people = People;
        $scope.data = Data;
        $scope.editUser = function (id) {
            $location.path('edituser/' + id);
        }
    }])
    .controller('editUserCtrl', ['$scope', 'People', 'Data', '$location', '$routeParams', function ($scope, People, Data, $location, $route) {
        $scope.people = People;
        $scope.data = Data;
        $scope.$route = $route;
        var index = -1;
        for (var i = 0, len = $scope.people.length; i < len; i++) {
            if ($scope.people[i].id === Number($scope.$route.id)) {
                index = i;
                break;
            }
        }
        $scope.prenom = $scope.people[index].prenom;
        $scope.sucre = $scope.people[index].sucre;
        $scope.touillette = $scope.people[index].touillette;
        $scope.vacances = $scope.people[index].vacances;
        $scope.submit = function () {
            $scope.people[index].prenom = $scope.prenom;
            $scope.people[index].sucre = $scope.sucre;
            $scope.people[index].touillette = $scope.touillette;
            $scope.people[index].vacances = $scope.vacances;
            $location.path('/');
        }
    }])
    .config(['$routeProvider', '$locationProvider', '$mdThemingProvider', function ($routeProvider, $locationProvider, $mdThemingProvider) {
        $mdThemingProvider.theme('default').primaryPalette('brown');
        $routeProvider
            .when('/', {
                templateUrl: 'view/index.html',
                controller: 'listCtrl'
            })
            .when('/presents', {
                templateUrl: 'view/presents.html',
                controller: 'presentsCtrl'
            })
            .when('/sucre', {
                templateUrl: 'view/sucre.html',
                controller: 'sucreCtrl'
            })
            .when('/newuser', {
                templateUrl: 'view/newuser.html',
                controller: 'newUserCtrl'
            })
            .when('/userlist', {
                templateUrl: 'view/userlist.html',
                controller: 'userListCtrl'
            })
            .when('/edituser/:id', {
                templateUrl: 'view/edituser.html',
                controller: 'editUserCtrl'
            });
        $locationProvider.html5Mode(true);
    }]);



