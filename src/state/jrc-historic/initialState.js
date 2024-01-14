const initialState = {
  pointsForDNF: false,
  websiteName: "jrc-results",
  subfolderName: "historic",
  showLivePoints: false,
  showLivePointsDaysRemaining: 4,
  showCarNameAsTextInResults: true,
  useStandingsForHome: true,
  nullTeamIsPrivateer: true,
  backgroundStyle:
    "background-color: #FFFEFE;\n" +
    "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='557' height='557' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23F7DCF9' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%23FFCFD9'%3E%3Ccircle cx='769' cy='229' r='5'/%3E%3Ccircle cx='539' cy='269' r='5'/%3E%3Ccircle cx='603' cy='493' r='5'/%3E%3Ccircle cx='731' cy='737' r='5'/%3E%3Ccircle cx='520' cy='660' r='5'/%3E%3Ccircle cx='309' cy='538' r='5'/%3E%3Ccircle cx='295' cy='764' r='5'/%3E%3Ccircle cx='40' cy='599' r='5'/%3E%3Ccircle cx='102' cy='382' r='5'/%3E%3Ccircle cx='127' cy='80' r='5'/%3E%3Ccircle cx='370' cy='105' r='5'/%3E%3Ccircle cx='578' cy='42' r='5'/%3E%3Ccircle cx='237' cy='261' r='5'/%3E%3Ccircle cx='390' cy='382' r='5'/%3E%3C/g%3E%3C/svg%3E\");",
  logo: "JRC.png",
  siteTitlePrefix: "JRC Historic",
  divisions: {
    historic2401: {
      divisionName: "historic2401",
      displayName: "JRC Historic",
      disableSameCarValidation: true,
      maxDriversScoringPointsForTeam: 2,
      wrc: [
        {
          clubId: "18",
          championshipIds: ["5nNESofLMdqK6ypK1"],
          includeNextChampionships: true
        }
      ],
      events: [],
      points: {
        powerStage: [],
        overall: [
          35,
          29,
          26,
          23,
          20,
          18,
          16,
          14,
          12,
          11,
          10,
          9,
          8,
          7,
          6,
          5,
          4,
          3,
          2,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1,
          1
        ]
      },
      manualResults: []
    }
  },
  historicalSeasonLinks: [
    {
      name: "Historic 2023-11",
      href: "/historic/historic-17"
    },
    {
      name: "Historic 2023-06",
      href: "/historic/historic-16"
    },
    {
      name: "Historic 2023-05",
      href: "/historic/historic-15"
    },
    {
      name: "Historic 2023-04",
      href: "/historic/historic-14"
    },
    {
      name: "Historic 2023-02",
      href: "/historic/historic-13"
    },
    {
      name: "Historic 2022-09",
      href: "/historic/historic-12"
    },
    {
      name: "Historic 2022-08",
      href: "/historic/historic-11"
    },
    {
      name: "Historic 2022-06",
      href: "/historic/historic-10"
    },
    {
      name: "Historic 2022-01",
      href: "/historic/historic-9"
    },
    {
      name: "Historic 2021-11",
      href: "/historic/historic-8"
    },
    {
      name: "Historic 2021-09",
      href: "/historic/historic-7"
    },
    {
      name: "Historic 2021-06",
      href: "/historic/historic-6"
    },
    {
      name: "Historic 2021-04",
      href: "/historic/historic-5"
    },
    {
      name: "Historic 2021-03",
      href: "/historic/historic-4"
    },
    {
      name: "Historic 2021-01",
      href: "/historic/historic-3"
    },
    {
      name: "Historic 2020-12",
      href: "/historic/historic-2"
    },
    {
      name: "Historic 2020-11",
      href: "/historic/historic-1"
    }
  ]
};

module.exports = initialState;
