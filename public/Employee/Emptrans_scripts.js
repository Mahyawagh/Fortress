// Emptrans_scripts.js
document.addEventListener('DOMContentLoaded', function() {
    fetchProjectList(); // Fetch project list when content is loaded
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        searchProject();
    });
  });
  
  function fetchProjectList() {
      fetch('/Emptrans/project_list')
      .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();0
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
    fetch(`/Emptrans/search?searchInput=${searchInput}`)
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
              link.href = `/Emptrans/display?projectId=${project.project_id}`;
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
              link.href = `/Emptrans/get-image/${file.filename}`;
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
    fetch(`/Emptrans/display_tendersight?projectId=${projectId}`)
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
          link.href = `/Emptrans/get-tendersight/${tendersight}`;
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
    fetch(`/Emptrans/display_tentativeletter?projectId=${projectId}`)
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
          link.href = `/Emptrans/get-tentativeletter/${tentativeletter}`;
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
    fetch(`/Emptrans/display_bidsfinancial?projectId=${projectId}`)
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
          link.href = `/Emptrans/get-bidsfinacial/${bidsfinacial}`;
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
    fetch(`/Emptrans/display_bidstechnical?projectId=${projectId}`)
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
          link.href = `/Emptrans/get-bidstechnical/${bidstechnical}`;
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
  
  