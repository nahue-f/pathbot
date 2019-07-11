'use strict'

const request = require('request-promise')
const baseURI = 'https://api.noopschallenge.com/pathbot'

const knownRooms = {}
let finished = false

async function move (room, direction) {
  return request({
    method: 'POST',
    json: true,
    uri: `${baseURI}/${room}`,
    body: { direction }
  })
}

async function traverse (thisRoom) {
  const room = thisRoom.locationPath && thisRoom.locationPath.replace('/pathbot/', '')

  console.log('Traverse... ', {
    exits: thisRoom.exits,
    mazeExitDirection: thisRoom.mazeExitDirection,
    mazeExitDistance: thisRoom.mazeExitDistance
  })

  if (finished) {
    // Do nothing.
  } else if (thisRoom.status === 'finished') {
    finished = true
    console.log(thisRoom.description)
    throw '///// SOLVED! \\\\\\'
  } else if (!knownRooms[room] || (knownRooms[room] && !knownRooms[room].been)) {
    console.log('New room!')
    knownRooms[room] = { been: true }

    for (let exit of thisRoom.exits) {
      await traverse(await move(room, exit))
    }
  } else {
    console.log('Dead end.')
  }
}

async function solve () {
  const init = await request.post({ uri: `${baseURI}/start`, json: true })

  await traverse(init)
    .catch(e => console.log(e))
}

solve()
