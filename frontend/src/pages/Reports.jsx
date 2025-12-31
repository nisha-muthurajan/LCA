import axios from 'axios';

// Add this function inside Dashboard component
const downloadReport = async () => {
    try {
        const response = await axios.post(
            'http://localhost:8000/api/projects/report/', 
            { project_data: originalFormData, results: data }, // You need to pass the original form data here
            { responseType: 'blob' } // Important for handling PDF files
        );
        
        // Create a link to download the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'LCA_Report.pdf');
        document.body.appendChild(link);
        link.click();
    } catch (error) {
        console.error("Error downloading report", error);
    }
};

// Add this button in your Dashboard return JSX
// <button onClick={downloadReport} className="btn btn-secondary mt-3">Download PDF Report 📄</button>