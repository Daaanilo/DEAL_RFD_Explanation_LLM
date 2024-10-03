# DEAL: Dependencies Explanation with Advanced Language Models

Interactive web platform for managing discovery results and their related statistics, supported by Large Language Models.

It is divided into two main pages:

- **Page 1: File Management**
  - Appears when the tool is launched.
  - Allows users to:
    - Upload files.
    - View files.
    - Search for files.
    - Delete files.
    - Pin files.
    - Move files.

- **Page 2: File Details**
  - Dedicated to the detailed view of individual files.
  - Contains a total of 21 cards grouped into three sections:
    1. **Dataset**: 
       - Includes all information related to the data present in the data source.
       - Displays key characteristics of the dataset.
    2. **Algorithm**:
       - Focuses on the algorithm used for dependency discovery.
       - Provides execution details and other relevant information.
    3. **Dependencies Analysis**:
       - Summarizes the results of the dependency discovery analysis.
       - Allows filtering of the discovered RFD (Relational Functional Dependencies) through specific cards.
       - Includes default instructions generated via prompt engineering and prompt tuning.
       - Instructions are dynamically generated and modifiable in real time.
