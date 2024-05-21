// HRcurrent_scripts.js
document.addEventListener('DOMContentLoaded', function() {
    fetchProjectList(); // Fetch project list when content is loaded
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission
        searchProject();
    });
  });
  
  function fetchProjectList() {
      fetch('/HRcurrentsearch/project_list')
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
            <th>Emp ID</th>
            <th>Employee Name</th>
            <th>Year</th>
        </tr>
    `;

    // Iterate through each project and create a row for each
    projects.forEach(project => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${project.emp_id}</td>
            <td>${project.Employee_name}</td> <!-- Make sure the property name is correct -->
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
    fetch(`/HRcurrentsearch/search?searchInput=${searchInput}`)
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
                link.href = `/HRcurrentsearch/display?empId=${project.emp_id}`;
                link.textContent = `${project.Employee_name} (${project.year})`;
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
                link.href = `/HRcurrentsearch/get-image/${file.filename}`;
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

function viewDocumentation(empId) {
    fetch(`/HRcurrentsearch/display_documentation?empId=${empId}`)
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
          link.href = `/HRcurrentsearch/get-documentation/${doc}`;
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