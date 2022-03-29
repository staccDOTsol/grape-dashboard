# Grape Dashboard | Getting Started 

- docs soon...


REFERENCES:
- 

WALLET ADAPTER:
- currently using an older version build until the packages have been migrated to a parcel build
- Solana Wallet Adapter (https://github.com/solana-labs/wallet-adapter)

UI:
- Interface: MUI 5 https://mui.com

CREATE YOU OWN COMPONENT TO INTEGRATE WITH THE DASHBOARD:
- Create a new folder in views > XYZ
- (refer to the template component in views > Home > Template > GrapeTemplate.tsx)
- Add the component to views > Home > Home.tsx
- Note that Home.tsx has conditional loading, call the component in the function: BasicComponent

TODO:
- Add Governance support to show:
    - realms participating communities
    - realms positions/votes available
    - view open votes
    - participate in open votes
    - deposit/withdraw positions/votes to/from realms
- Add additional support for Jupiter swap
- Add additional farming

BUILD:
```
yarn install
yarn run build
yarn start
```