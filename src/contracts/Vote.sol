pragma solidity ^0.5.0;

contract VoteForBest{
	uint256 public southPark;
	uint256 public itsAlwaysSunny;


	function voteSouthPark()public{
		southPark++;
	}

	function voteItAlwaysSunny()public{
		itsAlwaysSunny++;
	}

}
