//scripts_PEMP.js
function openInsertForm() {
    document.getElementById('insertForm').style.display = 'block';
}

function closeInsertForm() {
    document.getElementById('insertForm').style.display = 'none';
}

function handleFileInputChange(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        displayUploadedFiles(Array.from(files));
    }
}

function displayUploadedFiles(files) {
    const uploadedFilesContainer = document.getElementById('documentationContainer');
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

function submitProject() {
    const formData = new FormData(document.getElementById('insertForm')); // Corrected form ID
    fetch('/hrprevious/upload', {
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


function refreshGrid() {
    fetch('/hrprevious/projectsHTML')
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

document.addEventListener('DOMContentLoaded', refreshGrid);

function openDisplayForm() {
    document.getElementById('searchForm').style.display = 'block';
}

function closeDisplayForm() {
    document.getElementById('searchForm').style.display = 'none';
}

function searchProject() {
    const searchInput = document.getElementById('searchInput').value;
    fetch(`/hrprevious/search?searchInput=${searchInput}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const projectUrl = `/hrprevious/display?empId=${data.empId}`;
        window.open(projectUrl, '_blank');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while searching project.');
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

function viewDocumentation(empId) {
    fetch(`/hrprevious/display_documentation?empId=${empId}`)
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
          link.href = `/hrprevious/get-documentation/${doc}`;
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

function openDeleteForm() {
    document.getElementById("deleteForm").style.display = "block";
  }
  
  function closeDeleteForm() {
    document.getElementById("deleteForm").style.display = "none";
  }
  
  function deleteProject() {
    const searchInput = document.getElementById("deleteInput").value;

    fetch("/hrprevious/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchInput: searchInput }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((data) => {
            alert(data.message);
            closeDeleteForm(); // Close the form after successful deletion
            refreshGrid(); // Refresh the grid to reflect the changes
        })
        .catch((error) => {
            console.error("There was a problem with your fetch operation:", error);
            alert("Failed to delete project. Please try again later.");
        });
}
function openUpdateForm() {
    document.getElementById('updateForm').style.display = 'block';
}

function closeUpdateForm() {
    document.getElementById('updateForm').style.display = 'none';
}

function updateDocumentation() {
    const empId = document.getElementById('updateEmpId').value;
    const formData = new FormData();
    const newDocumentationFiles = document.getElementById('newDocumentation').files;
    formData.append('empId', empId);
    for (const file of newDocumentationFiles) {
        formData.append('newDocumentation', file);
    }

    fetch('/hrprevious/update', {
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
        closeUpdateForm(); // Close the form after successful update
        refreshGrid(); // Refresh the grid to reflect the changes
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
}
