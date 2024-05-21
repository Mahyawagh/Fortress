// othertour_scripts.js
document.addEventListener('DOMContentLoaded', function() {
    fetchProjectList(); // Fetch project list when content is loaded
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        searchProject();
    });
  });
  
  function fetchProjectList() {
      fetch('/standardurbansearch/project_list')
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
              <th>Ref ID</th>
              <th> Name</th>
              <th>Year</th>
          </tr>
      `;
  
      // Iterate through each project and create a row for each
      projects.forEach(project => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${project.ref_id}</td>
              <td>${project.Name}</td>
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
    fetch(`/standardurbansearch/search?searchInput=${searchInput}`)
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
                link.href = `/standardurbansearch/display?refId=${project.ref_id}`;
                link.textContent = `${project.Name} (${project.year})`;
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
                link.href = `/standardurbansearch/get-image/${file.filename}`;
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

function viewDocumentation(refId) {
    fetch(`/standardurbansearch/display_documentation?refId=${refId}`)
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
          link.href = `/standardurbansearch/get-documentation/${doc}`;
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