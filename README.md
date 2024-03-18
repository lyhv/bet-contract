## Run All Task
```bash
just do-bet
```
## Steps

### Set Bet Contract

```bash
just set-contracts optimism NBABet false && just set-contracts base XProofOfBetNFT false
```

### Deploy Contracts

```bash
just deploy optimism base
```

### Sanity check to verify that configuration files match with your deployed contracts

```bash
just sanity-check
```

### Create Channel

```bash
just create-channel
```

### Set bet info

```bash
just send-bet-info
```