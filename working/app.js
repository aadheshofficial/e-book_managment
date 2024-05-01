angular.module('myApp', [])
  .controller('myController', function($scope, $http) {
    $scope.formData = {}; // Initialize form data object
    $scope.bookList = []; // Initialize book list
    $scope.editIndex = null; // Initialize index for editing book

    // Function to create or update a book
    $scope.createOrUpdateBook = function() {
      var requestData = { // Wrap form data in an object
        book_id: $scope.formData.book_id,
        book_name: $scope.formData.book_name,
        book_author: $scope.formData.book_author,
        book_cost: $scope.formData.book_cost,
        book_pages: $scope.formData.book_pages,
        book_total: $scope.formData.book_total,
        book_file: $scope.formData.book_file // Assuming you're also sending the file path
      };

      if ($scope.editIndex !== null) {
        // Update existing book
        $scope.bookList[$scope.editIndex] = angular.copy($scope.formData);
        $scope.editIndex = null; // Reset edit index
      } else {
        // Add new book to the list
        $scope.bookList.push(angular.copy($scope.formData));
      }

      // Clear form data
      $scope.formData = {};

      // Send book data to Flask server
      $http.post('http://localhost:5000/add_book', requestData) // Send requestData instead of $scope.formData
        .then(function(response) {
          // Handle success
          console.log('Book added successfully:', response.data.message);
        })
        .catch(function(error) {
          // Handle error
          console.error('Error adding book:', error);
        });
    };

    // Function to remove a book from the list
    $scope.removeBook = function(book) {
      var index = $scope.bookList.indexOf(book);
      if (index !== -1) {
        $scope.bookList.splice(index, 1);
      }
    };

    // Function to edit a book
    $scope.editBook = function(book) {
      // Set form data for editing
      $scope.formData = angular.copy(book);
      // Find index of the book in the list
      $scope.editIndex = $scope.bookList.indexOf(book);
    };

    // Function to handle file upload
    $scope.uploadFile = function(file) {
      var formData = new FormData();
      formData.append('file', file);

      $http.post('http://localhost:5000/upload', formData, {
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      }).then(function(response) {
        // Handle success
        console.log('File uploaded successfully:', response.data);
        // Add file data to form data
        $scope.formData.book_file = response.data.filePath; // Assuming the server sends back the file path
        // Proceed with adding/updating book
        $scope.createOrUpdateBook();
      }).catch(function(error) {
        // Handle error
        console.error('Error uploading file:', error);
      });
    };

    // Watch for changes in file input
    $scope.$watch('formData.book_file', function(newFile, oldFile) {
      if (newFile !== oldFile) {
        $scope.uploadFile(newFile);
      }
    });
  });
