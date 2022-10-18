const generatePoints = () => {
  const generatedPoints = [];
  for (let i = 50; i > 0; i--) {
    generatedPoints.push(i);
  }
  return generatedPoints;
};

const points = generatePoints();

const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "birthday",
  showLivePoints: true,
  showCarsAlways: true,
  showCarNameAsTextInStandings: true,
  showCarNameAsTextInResults: true,
  useCarAsTeam: false,
  disableOverall: true,
  teamPointsForPowerstage: false,
  backgroundStyle:
    "background-image: url('./assets/birthday.jpg'); background-size: cover; background-repeat: no-repeat; background-attachment: fixed;",
  logo: "JRC.png",
  siteTitlePrefix: "JRC Birthday",
  divisions: {
    combined: {
      divisionName: "birthdayOverall",
      displayName: "JRC 3rd Birthday Overall",
      clubs: [
        { clubId: "418732", championshipIds: ["623080"] },
        { clubId: "418733", championshipIds: ["623081"] }
      ],
      events: [],
      points: {
        overall: points
      }
      // cars: [
      //   "Citroën C3 R5",
      //   "Ford Fiesta R5",
      //   "Mitsubishi Space Star R5",
      //   "Citroën C3 R5",
      //   "Peugeot 208 T16 R5",
      //   "ŠKODA Fabia R5",
      //   "Volkswagen Polo GTI R5",
      //   "Opel Adam R2",
      //   "Peugeot 208 R2"
      // ]
    },
    awd: {
      divisionName: "AWD",
      displayName: "JRC 3rd Birthday 4WD",
      clubs: [{ clubId: "418732", championshipIds: ["623080"] }],
      events: [],
      points: {
        overall: points
      }
      // cars: ["Opel Adam R2", "Peugeot 208 R2"]
    },
    rwd: {
      divisionName: "RWD",
      displayName: "JRC 3rd Birthday RWD",
      clubs: [{ clubId: "418733", championshipIds: ["623081"] }],
      events: [],
      points: {
        overall: points
      }
      // cars: ["Opel Adam R2", "Peugeot 208 R2"]
    }
  }
};

module.exports = initialState;
