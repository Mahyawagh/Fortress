//Evcironmental Scripts
//scripts.js
function openInsertForm() {
  document.getElementById('projectForm').style.display = 'block';
  document.getElementById('updateForm').style.display = 'none';
}

// Function to close insert form
function closeInsertForm() {
  document.getElementById('projectForm').style.display = 'none';
}

// Function to handle file input change event
function handleFileInputChange(event) {
  const files = event.target.files;
  if (files && files.length > 0) {
      displayUploadedFiles(Array.from(files));
  }
}

function displayUploadedFiles(files) {
  const uploadedFilesContainer = document.getElementById('photographsContainer');
  uploadedFilesContainer.innerHTML = '';
  files.forEach(file => {
      const fileType = file.type.split('/')[0];
      if (fileType === 'image') {
          // Display photographs
      } else if (fileType === 'application' && file.type === 'application/pdf') {
          const doc = document.createElement('p');
          doc.textContent = file.name;
          uploadedFilesContainer.appendChild(doc);
      } else if (fileType  === 'application' && file.type === 'application/pdf') {
           const report = document.createElement('p');
           report.textContent = file.name;
           uploadedFilesContainer.appendChild(report);
      }
  
  });
  uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}


// Attach event listener to file input
const fileInputs = document.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
  input.addEventListener('change', handleFileInputChange);
});

// Function to submit the form
function submitProject() {
  const formData = new FormData(document.getElementById('projectForm'));
  fetch('/environmental/upload', {
      method: 'POST',
      body: formData
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      alert(data.message);
      closeInsertForm(); // Close the form after successful submission
      refreshGrid();
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
  });
}

// Function to refresh the projects grid
function refreshGrid() {
  fetch('/environmental/projectsHTML')
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.text();
  })
  .then(html => {
      document.getElementById('projectsGrid').innerHTML = html;
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching projects.');
  });
}

// Call refreshGrid() when the page loads to initially populate the projects grid
document.addEventListener('DOMContentLoaded', refreshGrid);

// Function to open the display form
function openDisplayForm() {
  document.getElementById('searchForm').style.display = 'block';
}

// Function to close the display form
function closeDisplayForm() {
  document.getElementById('searchForm').style.display = 'none';
}

// Function to search for a project
function searchProject() {
  const searchInput = document.getElementById('searchInput').value;
  fetch(`/environmental/search?searchInput=${searchInput}`)
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      const projectUrl = `/environmental/display?projectId=${data.projectId}`;
      window.open(projectUrl, '_blank');
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while searching project.');
  });
}

// Function to display photographs of a specific project along with a list
function viewPhotographs(projectId) {
  fetch(`/environmental/display_project?projectId=${projectId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const photographs = data.photographs;
      const photographsContainer = document.getElementById('photographsContainer');
      photographsContainer.innerHTML = '';
      
      // Create a list to display photographs
      const list = document.createElement('ul');
      photographs.forEach(photo => {
        const listItem = document.createElement('li');
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,' + photo.data;
        img.alt = 'Photograph';
        listItem.appendChild(img);
        list.appendChild(listItem);
      });
      photographsContainer.appendChild(list);
  
      // Show photographs container
      photographsContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching photographs.');
    });
}

// Function to display image in a modal
function displayImage(imageUrl) {
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';

  const modalImage = document.createElement('img');
  modalImage.src = imageUrl;
  modalImage.className = 'modal-image';

  modalContainer.appendChild(modalImage);
  document.body.appendChild(modalContainer);

  // Close modal when clicking outside the image
  modalContainer.addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
}

function displayDocumentation(files) {
  const uploadedFilesContainer = document.getElementById('documentationContainer');
  uploadedFilesContainer.innerHTML = '';
  files.forEach(file => {
      const doc = document.createElement('p');
      doc.textContent = file.name;
      uploadedFilesContainer.appendChild(doc);
  });
  uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}

// Function to view documentation files
function viewDocumentation(projectId) {
  fetch(`/environmental/display_documentation?projectId=${projectId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const documentation = data.documentation;
      const documentationContainer = document.getElementById('documentationContainer');
      documentationContainer.innerHTML = '';
      
      // Create a list to display documentation files
      const list = document.createElement('ul');
      documentation.forEach(doc => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/environmental/get-documentation/${doc}`;
        link.textContent = doc;
        listItem.appendChild(link);
        list.appendChild(listItem);
      });
      documentationContainer.appendChild(list);
  
      // Show documentation container
      documentationContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching documentation.');
    });
}

function displayReport(files) {
  const uploadedFilesContainer = document.getElementById('reportContainer');
  uploadedFilesContainer.innerHTML = '';
  files.forEach(file => {
      const report = document.createElement('p');
      doc.textContent = file.name;
      uploadedFilesContainer.appendChild(report);
  });
  uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}
// Function to display reports of a specific project
function viewReport(projectId) {
  fetch(`/environmental/display_report?projectId=${projectId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const report = data.report;
      const reportContainer = document.getElementById('reportContainer');
      reportContainer.innerHTML = '';
      
      // Create a list to display report
      const list = document.createElement('ul');
      report.forEach(report => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/environmental/get-report/${report}`;
        link.textContent = report;
        listItem.appendChild(link);
        list.appendChild(listItem);
      });
      reportContainer.appendChild(list);
  
      // Show reports container
      reportContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching report.');
    });
}

function displayPresentation(files) {
  const uploadedFilesContainer = document.getElementById('presentationContainer');
  uploadedFilesContainer.innerHTML = '';
  files.forEach(file => {
      const presentation = document.createElement('p');
      presentation.textContent = file.name;
      uploadedFilesContainer.appendChild(presentation);
  });
  uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}

// Function to view presentations of a specific project
function viewPresentation(projectId) {
  fetch(`/environmental/display_presentation?projectId=${projectId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const presentation = data.presentation;
      const presentationContainer = document.getElementById('presentationContainer');
      presentationContainer.innerHTML = '';
      
      // Create a list to display presentation
      const list = document.createElement('ul');
      presentation.forEach(presentation => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/environmental/get-presentation/${presentation}`;
        link.textContent = presentation;
        listItem.appendChild(link);
        list.appendChild(listItem);
      });
      presentationContainer.appendChild(list);
  
      // Show presentations container
      presentationContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching presentation.');
    });
}

function displayOther(files) {
  const uploadedFilesContainer = document.getElementById('otherContainer');
  uploadedFilesContainer.innerHTML = '';
  files.forEach(file => {
      const other = document.createElement('p');
      other.textContent = file.name;
      uploadedFilesContainer.appendChild(other);
  });
  uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}

// Function to view other files of a specific project
function viewOther(projectId) {
  fetch(`/environmental/display_other?projectId=${projectId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const other = data.other;
      const otherContainer = document.getElementById('otherContainer');
      otherContainer.innerHTML = '';
      
      // Create a list to display other files
      const list = document.createElement('ul');
      other.forEach(other => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `/environmental/get-other/${other}`;
        link.textContent = other;
        listItem.appendChild(link);
        list.appendChild(listItem);
      });
      otherContainer.appendChild(list);
  
      // Show other files container
      otherContainer.style.display = 'block';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while fetching other files.');
    });
}

function openDeleteForm() {
  document.getElementById("deleteForm").style.display = "block";
}

function closeDeleteForm() {
  document.getElementById("deleteForm").style.display = "none";
}

function deleteProject() {
  const searchInput = document.getElementById("deleteInput").value;
  // Send AJAX request to delete project
  fetch(`/environmental/delete?searchInput=${searchInput}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          alert(data.message);
          closeDeleteForm();
          refreshGrid();
      })
      .catch(error => {
          console.error('There was a problem with your fetch operation:', error);
          alert('Failed to delete project. Please try again later.');
      });
}

// Update button . click on the update button and fill the form 
function openUpdateForm() {
  var projectId = prompt("Enter Project ID:");
  if (projectId !== null) {
      document.getElementById("projectId").value = projectId;
      document.getElementById("updateForm").style.display = "block";
  }
}
function closeUpdateForm() {
  document.getElementById("updateForm").style.display = "none";
}

//
document.getElementById("updateForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form submission
  
  // Get form data
  var form = document.getElementById("updateForm");
  var formData = new FormData(form);

  // Send update request to server
  fetch("/environmental/update", {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    // Display success message
    alert("Project updated successfully!");
    // Optionally, reset the form or perform other actions
    closeUpdateForm();
    refreshGrid();
  })
  .catch(error => {
    console.error("Error:", error.message);
    // Display error message
    alert("An error occurred. Please try again later.");
  });
});
