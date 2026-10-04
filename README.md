<div align="center">
  
# College Path Finder


  
[![Backend CI/CD](https://github.com/chetanr25/college-pathfinder/actions/workflows/backend-ci-cd.yml/badge.svg)](https://github.com/chetanr25/college-pathfinder/actions/workflows/backend-ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)

</div>

<br />
An open-source counselling assistant for KCET engineering admissions. It helps students find colleges and branches within reach of their rank, compare options across counselling rounds, and ask questions in plain language, all backed by the official cutoff data published by KEA.

<br />


**Live:** [college-finder.chetanr25.in](https://college-finder.chetanr25.in)

## What it solves

Every year, KCET candidates have to turn a rank into an ordered list of college and branch preferences before counselling. The data they need is public, but hard to use:

- Cutoffs are released as long PDFs, split by round, which makes a simple question like "which CS colleges can I get at my rank" slow to answer.
- Choosing well means comparing colleges and branches side by side, and across rounds, since cutoffs change from one round to the next.
- Students refer to colleges and branches by short names ("RV", "PES", "CSE"), while the official data uses full names and codes.
- Reliable guidance often depends on paid counsellors or word of mouth.

College Path Finder turns that data into something a student can search, compare and talk to.

## Features

- **Rank predictor:** enter a rank, pick a round and optionally filter by branch to see the colleges within reach.
- **College and branch explorer:** browse every college and branch, and view cutoffs across all rounds.
- **Counselling assistant:** ask questions such as "top CS colleges for rank 8000 in round 2" or "compare RVCE and BMSCE for electronics", with answers drawn from the cutoff data.
- **Email reports:** receive a summary of options and comparisons by email.
- **Shareable results:** share predictor results as a link with a rich preview.

## How predictions work

Predictions compare a student's rank against the closing ranks KEA published for each college, branch and counselling round in the previous admission cycle. Options whose cutoffs fall within reach of the rank are shown, ordered from most to least competitive.

Cutoffs shift every year, so predictions are a guide for building a preference list, not a guarantee of a seat. Always confirm with official KEA notifications.

## Architecture

<img width="1061" height="1286" alt="Major project-2" src="https://github.com/user-attachments/assets/fa61f694-13f3-4bcf-98ac-e97bcf40d731" />


## Chat flow

<img width="745" height="1419" alt="Major project-3" src="https://github.com/user-attachments/assets/c8d102c4-c853-41d3-81ac-31adbc41388f" />


## Documentation

- [Contributing](CONTRIBUTING.md)
- [API](docs/API_DOCUMENTATION.md)
- [Schema](docs/SCHEMA.md)
- [Commands](docs/COMMANDS.md)
- [Environment variables](docs/ENVIRONMENT.md)

## Contributing

Contributions are welcome. See [Contributing](CONTRIBUTING.md) to set up the project locally and open a pull request, or use the [issue tracker](https://github.com/chetanr25/college-pathfinder/issues) to report bugs and suggest features.

## License

Released under the [MIT License](LICENSE).

> ###### College Path Finder is an independent project. It is not affiliated with or endorsed by KEA or the Government of Karnataka.
