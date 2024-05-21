


//scripts_TB.js
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
    const uploadedFilesContainer = document.getElementById('tendersightsContainer');
    uploadedFilesContainer.innerHTML = '';
    files.forEach(file => {
        const fileType = file.type.split('/')[1]; // Get the file extension
        if (fileType === 'pdf' || fileType === 'docx') {
            const doc = document.createElement('p');
            doc.textContent = file.name;
            uploadedFilesContainer.appendChild(doc);
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
    fetch('/BDtransport/upload', {
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
    fetch('/BDtransport/projectsHTML')
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
    fetch(`/BDtransport/search?searchInput=${searchInput}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const projectUrl = `/BDtransport/display?projectId=${data.projectId}`;
        window.open(projectUrl, '_blank');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while searching project.');
    });
  }
  
 
  
  function displayTendersight(files) {
    const uploadedFilesContainer = document.getElementById('tendersightContainer');
    uploadedFilesContainer.innerHTML = '';
    files.forEach(file => {
        const tendersight = document.createElement('p');
        tendersight.textContent = file.name;
        uploadedFilesContainer.appendChild(tendersight);
    });
    uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
}

  
  function viewTendersight(projectId) {
    fetch(`/BDtransport/display_tendersight?projectId=${projectId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const tendersight = data.tendersight;
        const tendersightContainer = tendersight.getElementById('tendersightContainer');
        tendersightContainer.innerHTML = '';
        
        const list = tendersight.createElement('ul');
        tendersight.forEach(tendersight => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
          link.href = `/BDtransport/get-tendersight/${tendersight}`;
          link.textContent = tendersight;
          listItem.appendChild(link);
          list.appendChild(listItem);
        });
        tendersightContainer.appendChild(list);
    
        tendersightContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching tendersight.');
      });
  }
  
  function displayTentativeletter(files) {
    const uploadedFilesContainer = document.getElementById('tentativeletterContainer');
    uploadedFilesContainer.innerHTML = '';
    files.forEach(file => {
        const tentativeletter = document.createElement('p');
        tentativeletter.textContent = file.name;
        uploadedFilesContainer.appendChild(tentativeletter);
    });
    uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
  }
  function viewTentativeletter(projectId) {
    fetch(`/BDtransport/display_tentativeletter?projectId=${projectId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const tentativeletter = data.tentativeletter;
        const tentativeletterContainer = document.getElementById('tentativeletterContainer');
        tentativeletterContainer.innerHTML = '';
        
        const list = document.createElement('ul');
        tentativeletter.forEach(tentativeletter => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = `/BDtransport/get-tentativeletter/${tentativeletter}`;
          link.textContent = tentativeletter;
          listItem.appendChild(link);
          list.appendChild(listItem);
        });
        tentativeletterContainer.appendChild(list);
    
        tentativeletterContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching tentativeletter.');
      });
  }
  
  function displayBidsfinacial(files) {
    const uploadedFilesContainer = document.getElementById('bidsfinacialContainer');
    uploadedFilesContainer.innerHTML = '';
    files.forEach(file => {
        const bidsfinacial = document.createElement('p');
        bidsfinacial.textContent = file.name;
        uploadedFilesContainer.appendChild(bidsfinacial);
    });
    uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
  }
  
  function viewBidsfinancial(projectId) {
    fetch(`/BDtransport/display_bidsfinancial?projectId=${projectId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const bidsfinacial = data.bidsfinacial;
        const bidsfinacialContainer = document.getElementById('bidsfinacialContainer');
        bidsfinacialContainer.innerHTML = '';
        
        const list = document.createElement('ul');
        bidsfinacial.forEach(bidsfinacial => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = `/BDtransport/get-bidsfinacial/${bidsfinacial}`;
          link.textContent = bidsfinacial;
          listItem.appendChild(link);
          list.appendChild(listItem);
        });
        bidsfinacialContainer.appendChild(list);
    
        bidsfinacialContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching bidsfinacial.');
      });
  }
  
  function displayBidstechnical(files) {
    const uploadedFilesContainer = document.getElementById('bidstechnicalContainer');
    uploadedFilesContainer.innerHTML = '';
    files.forEach(file => {
        const bidstechnical = document.createElement('p');
        bidstechnical.textContent = file.name;
        uploadedFilesContainer.appendChild(bidstechnical);
    });
    uploadedFilesContainer.style.display = 'block'; // Show uploaded files container
  }
  
  function viewBidstechnical(projectId) {
    fetch(`/BDtransport/display_bidstechnical?projectId=${projectId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const bidstechnical = data.bidstechnical;
        const bidstechnicalContainer = document.getElementById('bidstechnicalContainer');
        bidstechnicalContainer.innerHTML = '';
        
        const list = document.createElement('ul');
        bidstechnical.forEach(bidstechnical => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = `/BDtransport/get-bidstechnical/${bidstechnical}`;
          link.textContent = bidstechnical;
          listItem.appendChild(link);
          list.appendChild(listItem);
        });
        bidstechnicalContainer.appendChild(list);
    
        bidstechnicalContainer.style.display = 'block';
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching bidstechnical files.');
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
    fetch(`/BDtransport/delete?searchInput=${searchInput}`)
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
    fetch("/BDtransport/update", {
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
      closeUpdateForm();
      refreshGrid();
    })
    .catch(error => {
      console.error("Error:", error.message);
      // Display error message
      alert("An error occurred. Please try again later.");
    });
  });
  