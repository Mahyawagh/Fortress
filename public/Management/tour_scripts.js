// tour_trans_scripts.js
document.addEventListener('DOMContentLoaded', function() {
    fetchProjectList(); // Fetch project list when content is loaded
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        searchProject();
    });
  });
  
  function fetchProjectList() {
      fetch('/managementtourism/project_list')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          displayProjectList(data); // Call function to display project list
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred while fetching project list.');
      });
  }
  
  function displayProjectList(projects) {
      const projectGrid = document.getElementById('projectGrid');
      projectGrid.innerHTML = ''; // Clear previous project grid
  
      // Create table element
      const table = document.createElement('table');
      table.innerHTML = `
          <tr>
              <th>Project ID</th>
              <th>Project Name</th>
              <th>Year</th>
          </tr>
      `;
  
      // Iterate through each project and create a row for each
      projects.forEach(project => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${project.project_id}</td>
              <td>${project.project_name}</td>
              <td>${project.year}</td>
          `;
          table.appendChild(row);
      });
  
      // Append the table to the projectGrid
      projectGrid.appendChild(table);
  }
  
  // Function to search projects
  function searchProject() {
    const searchInput = document.getElementById('searchInput').value;
    fetch(`/managementtourism/search?searchInput=${searchInput}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displaySearchResults(data); // Call function to display search results
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while searching project.');
    });
  }
  
  // Function to display search results
function displaySearchResults(data) {
  const searchResultsContainer = document.getElementById('searchResults');

  if (searchResultsContainer) {
      searchResultsContainer.innerHTML = ''; // Clear previous search results

      // Display projects if found
      if (data.projects && data.projects.length > 0) {
          const projectsHeader = document.createElement('h3');
          projectsHeader.textContent = 'Projects';
          searchResultsContainer.appendChild(projectsHeader);
          data.projects.forEach(project => {
              const link = document.createElement('a');
              link.href = `/managementtourism/display?projectId=${project.project_id}`;
              link.textContent = `${project.project_name} (${project.year})`;
              link.setAttribute('target', '_blank');
              searchResultsContainer.appendChild(link);
              searchResultsContainer.appendChild(document.createElement('br')); // Add line break
          });
      }

      // Display files if found
      if (data.files && data.files.length > 0) {
          const filesHeader = document.createElement('h3');
          filesHeader.textContent = 'Files';
          searchResultsContainer.appendChild(filesHeader);
          data.files.forEach(file => {
              const link = document.createElement('a');
              link.href = `/managementtourism/get-image/${file.filename}`;
              link.textContent = `${file.filename}`;
              link.setAttribute('target', '_blank');
              searchResultsContainer.appendChild(link);
              searchResultsContainer.appendChild(document.createElement('br')); // Add line break
          });
      }

      // Display message if no projects or files found
      if ((!data.projects || data.projects.length === 0) && (!data.files || data.files.length === 0)) {
          const noResultsMessage = document.createElement('p');
          noResultsMessage.textContent = 'No projects or files found.';
          searchResultsContainer.appendChild(noResultsMessage);
      }
  } else {
      console.error('Search results container not found.');
  }
}
  
  
  
  
  // Function to display photographs of a specific project along with a list
  function viewPhotographs(projectId) {
      fetch(`/managementtourism/display_project?projectId=${projectId}`)
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
      fetch(`/managementtourism/display_documentation?projectId=${projectId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          const documentation = data.documentation;
          displayDocumentation(documentation); // Call function to display documentation
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
      fetch(`/managementtourism/display_report?projectId=${projectId}`)
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
            link.href = `/managementtourism/get-report/${report}`;
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
    fetch(`/managementtourism/display_presentation?projectId=${projectId}`)
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
          link.href = `/managementtourism/get-presentation/${presentation}`;
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
    fetch(`/managementtourism/display_other?projectId=${projectId}`)
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
          link.href = `/managementtourism/get-other/${other}`;
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
  