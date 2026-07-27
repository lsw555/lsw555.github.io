// Canvas-based binary particle morphing using only the characters 0 and 1.
(() => {
  const canvas = document.getElementById("particle-canvas");
  const stateLabel = document.getElementById("particle-heading");
  if (!canvas || !stateLabel) return;

  const ctx = canvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const palette = {
    white: "#183746",
    ice: "#2d6675",
    cyan: "#147f92",
    teal: "#2d8a87",
    blue: "#386f9c",
    green: "#557f59"
  };

  // Quantized Google MediaPipe canonical 3D face mesh (468 vertices, 1,365 unique edges).
  // Source: google-ai-edge/mediapipe canonical_face_model.obj (Apache License 2.0).
  const FACE_VERTEX_DATA = "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";
  const FACE_EDGE_DATA = "mwCtAIUAmwCFAK0AIQD2AAcAIQAHAPYAfgGOAWoBjgFqAX4BBwHSAfkA0gH5AAcBNAGfAUQBnwE0AUQBTgBfAF8AvwBOAL8AZAGFAQgBhQEIAWQBIgB/ACIAogB/AKIACAFwAXABhQGLAKIAIgCLAAAACwEAAC4BCwEuASUASAAAAEgAAAAlAAsALgEAAAsACwBIAF0BwwFeAcMBXQFeAXgAeQB5AOcAeADnAF4BxAHDAcQB5wDoAHkA6AANAS4BCwENASUAJwAnAEgADQEvAS4BLwFIAEkAJwBJAFcBZQFXAV4BXgFlAXkAgAByAHkAcgCAABUBXgEVAVcBLwByAC8AeQBlAcQBgADoAGUBxQHEAcUB6ADpAIAA6QArAU0BKQFNASkBKwFDAEUAQwBoAEUAaAApAUwBTAFNAWcAaABDAGcAmACvAJgAjAGvAIwBqwCvAJgAqwB5AYwBmAB5AZQAmACUAKsAfQGAAX4BgAF9AX4BmgCbAJsAnQCaAJ0AgAGOAZ0ArQAYAVsBSgFbARgBSgEyAGUAZQB2ADIAdgBKAVwBWwFcAXYAdwBlAHcADgEvAQ0BDgEnACgAKABJAA4BMAEvATABSQBKACgASgAJAFABlwBQAQkAlwBrAJcACQBrAJcAUQFQAVEBawBsAGwAlwAWAVgBFgFoAVgBaAFzAIMAMACDADAAcwAXAWgBFgEXATAAMQAxAIMABgGvAaIBrwEGAaIBIADCAMIA0wAgANMAogGoAagBrwHMANMAwgDMADABmAEOAZgBKAC4AEoAuAAOAZkBmAGZAbgAuQAoALkAEAE2ATYBlwEQAZcBKgC3AFAAtwAqAFAAlwGfATYBnwFQAL8AtwC/AA4BQgEOAZoBQgGaAVwAugAoALoAKABcAJkBmgG5ALoAWwHBAVwBwQF3AOUAdgDlAFwBwgHBAcIB5QDmAHcA5gCwAbIBrgGwAa4BsgHSANYA0gDUANQA1gCmAa4BpgGwAcoA1ADKANIAOQE6ARIAOgESADkBEgBTABIAVABTAFQAEQASABEAOgERAFQAMwF3ATIBdwEyATMBTABNAEwAkgBNAJIAIwEyASMBdwE9AJIAPQBMAAMBgwEEAYMBAwEEAR0AHgAeAKAAHQCgAAQBhAGDAYQBoAChAB4AoQAeAZ4BgAGeAR4BgAE4AJ0AnQC+ADgAvgCOAZ4BrQC+AJYBqAGWAaIBtgDCALYAzABPAZYBTwGoAWoAzABqALYAbwGgAWwBoAFsAW8BhwCKAIcAwACKAMAAbAGyAaABsgHAANYAhwDWAIcBpwFHAacBRwGHAWIApQBiAMsApQDLAEcBZgFmAacBgQDLAGIAgQAqAS0BHAEtARwBKgE2AEQANgBHAEQARwD7ABwB+wAtARUARwAVADYABAATAQUAEwEEAAUABQAtAAQALQAFABkBEwEZAS0AMwAFADMA/gB1Af0AdQH9AP4AFwAYABcAkAAYAJAA/QB2AXUBdgGQAJEAFwCRAEABQQEzAUEBMwFAAU0AWgBNAFsAWgBbAEEBdwFbAJIAGAGpAZsBqQEYAZsBMgC7ALsAzQAyAM0AmwGrAakBqwHNAM8AuwDPADkBpQHIADkByAClAcgAyQBTAMgAUwDJABIAyABBAU8BQQGWAVsAtgBbAGoAlQGWAUEBlQFbALUAtQC2AEEBlAGUAZUBtAC1AFsAtABAAZQBWgC0ABAAOgEQABEAEABUABAAOwE6ATsBVABVABAAVQAKAakBCgGqAakBqgHNAM4AJADOACQAzQCnAaoBCgGnASQAywDLAM4AcQGMAYwBkAFxAZABjACwAKsAsACMAKsAeQGQAZQAsAANAYcBDQFCAUIBhwFcAKUAJwBcACcApQChAdEBnQHRAZ0BoQG9AMEAvQD1AMEA9QCdAdAB0AHRAfQA9QC9APQAAQECAQIBggEBAYIBGwCfABwAnwAbABwAgQGCAQIBgQEcAJ4AngCfAIQB0wEEAdMBHgD3AKEA9wDSAdMBhAHSAaEA9gD2APcA+ADIAaMByAH4AKMBAwDEAMQA7AADAOwAjwGjAY8ByAGuAOwArgDEACoBTQEqAUwBRABnAEQAaAAcAUwBNgBnAAgAHQEIAKEBHQGhATcAwQAIAMEACAA3AKgAoQEIAKgAqADBAAUBVAEFAVoBVAFaAW8AdQAfAHUAHwBvAFoBwAEFAcABHwDkAHUA5AChAbkBHQG5ATcA3QDBAN0AnQG5Ab0A3QBHAcwBRgHMAUYBRwFhAGIAYQDwAGIA8ABGAUgBSAHMAWMA8ABhAGMAFQFjAUkBYwEVAUkBLwBkAGQAfgAvAH4ASQFzAWMBcwF+AI4AZACOADUBiAGIAbYBNQG2AU8A2gCmANoATwCmALYBtwGIAbcBpgDbANoA2wAAAX4BAAF9ARoAmgAaAJsAAAFVAVUBfgFwAJsAGgBwABcBpAFoAaQBgwDGADEAxgCkAa0BFwGtATEA0QDGANEAbAFtAWwBewFtAXsBiACWAIcAlgCHAIgAewGKAWwBigGHAKkAlgCpABUBtQFjAbUBfgDZAC8A2QBXAbUBcgDZALsBvAEaAbwBGgG7ATQA3wA0AOAA3wDgABoBGwEbAbwBNQDgADQANQATAWsBGQFrATMAhgAtAIYAawG4ARMBuAEtANwAhgDcAAYBiwGLAa8BqgDTACAAqgBxAYsBBgFxASAAjACMAKoAKwFRASsBUgFRAVIBbABtAEUAbQBFAGwAKQFSAUMAbQARAU8BEQFBASsAWwArAGoAEQF3ASsAkgBdAcIBXAFdAXcAeAB4AOYAwgHDAeYA5wBnAdMBVgFnAVYB0wFxAPcAcQCCAIIA9wBWAb4BZwG+AYIA4gBxAOIAGwFOARoBTgE0AGkANQBpACUBTgEbASUBNQA/AD8AaQD6AMoBygHOAfoAzgEUAPIA7gDyABQA7gDNAc4BygHNAe4A8QDxAPIAFAFhASwBYQEUASwBLgBGAEYAfAAuAHwALAF/AWEBfwF8AJwARgCcACQBRQEkAUQBRAFFAV8AYAA+AF8APgBgACQBNAE+AE4AFAEbARQBJQEuAD8ALgA1ACUBLAE/AEYACAG/AQgBWQFZAb8BdADjACIAdAAiAOMAWQF0AQgBdAEiAI8AdACPAFkBYAFZAVoBWgFgAXUAewB0AHUAdAB7AFQBWQFvAHQAAQATABMAEgEBABIBAQAsABMALAASAWIBEwBiARMAfQAsAH0A+AAZARkByAEzAOwAAwAzAGsByAGGAOwAqgGrAc4AzwCrAbQBqgG0Ac4A2ADPANgAfAF9AfwAfQH8AHwBFgCZABYAmgCZAJoA/AAAARYAGgCHAYkBDQGJAScApwClAKcACwGJASUApwDHAKwByACsAccAyADIANAAxwDQAKUBrAHJANAASQFKAQoBSQEKAUoBJABlACQAZABkAGUACgFzASQAjgARAbABEQGmASsAygArANQAEQEfAR8BsAE5ANQAKwA5APoAIgH6AEgBIgFIATwAYwAUAGMAFAA8AEgBzgFjAPIAAgEeAR4BgQE4AJ4AHAA4AIABgQGdAJ4AYQG+AVYBYQFxAHwAfADiAAkBYQEJAb4BIwDiACMAfAADAYIBAQEDARsAHQAdAJ8AggGDAZ8AoACmAa8BrgGvAdIA0wDKANMApgGoAcoAzABWAb0BFAFWARQBvQEuAOEALgBxAHEA4QBPAaYBagDKACQBMgEkATMBPgBNAD4ATAAzAUUBTQBgAG4BvwFgAb8BYAFuAXsAiQB7AOMAiQDjAAwBLgEMAS8BJgBJACYASAAPAS8BDAEPASYAKQApAEkAZgFzAQoBZgEkAIEAgQCOACYBRwEmAcwBQADwAEAAYgDHAcwBJgHHAUAA6wDrAPAAJgFLARYBSwEWASYBMABAADAAZgBAAGYAFwFLATEAZgAPATABKQBKABABMAEPARABKQAqACoASgCyAbQBqwGyAc8A1gDWANgAsAG0AdQA2AAQAZgBKgC4AJcBmAG3ALgAigGuAYsBrgGKAYsBqQCqAKoA0gCpANIAcQF6AXoBiwGVAKoAjACVAHoBkAGVALAAKAFOASsBTgEoASsBQgBFAEUAaQBCAGkATQFOAWgAaQCoAF8BXwGhAXoAwQB6AKgABgBfAQYAqAAGAHoAYAGbARgBYAEyAHsAewC7AGABeAF4AZsBkwC7AHsAkwA/AUABQAFFAT8BRQFZAGAAWgBgAFkAWgAdAScBJwFQAR0BUAE3AGsAQQBrADcAQQAoAVABJwEoAUEAQgBCAGsAQAGTAZMBlAGzALQAWgCzAD8BkwFZALMASQFcAWQAdwBJAV0BZAB4ACUBTQE/AGgAJQEqAT8ARABDAcYBbgHGAUMBbgFdAIkAiQDqAF0A6gC/AcYB4wDqAA8AOwEPABAADwBVAA8APAE7ATwBVQBWAA8AVgAXAWYBZgGtAYEA0QAxAIEASwFmAWYAgQAOADwBDgAPAA4AVgAOAD0BPAE9AVYAVwAOAFcACQAdAQgACQAJADcAFQFdAS8AeAD8AP0A/QB8ARcAmQAWABcAdgF8AZEAmQCSAZMBPgGTAT4BkgFYALIAWACzALIAswA+AT8BWABZAAYAowFfAaMBegDEAAYAxADFAKMBBgDFAMQAxQA+AUQBPgFFAVgAYABYAF8AbwGNAW0BbwFtAY0BiACsAIgAigCKAKwAIAGzAY0BswEgAY0BOgCsAKwA1wA6ANcAbwGzAYoA1wBYAbcBWAG2AXMA2gBzANsAFgG3ATAA2wAPATcBEAE3ASoAUQApAFEANgE3AVAAUQDDABkBBQDDADMAwwDDAPgAAwDDAB8BdwE5AJIAHwEjATkAPQCMAawBrwCsAa8A0ACrANAArwDHAAwBOAEPATgBKQBSACYAUgA3ATgBUQBSALwBvQEbAb0BNQDhAOAA4QD+AFMBUwF1AW4AkAAYAG4AdQGGAVMBhgFuAKMAkACjABoBJwEaASgBNABCADQAQQBbAcABWgFbAXUAdgB2AOQAwAHBAeQA5QBkAcYBZAG/AX8A4wB/AOoAKAFRAUIAbAAKAFEBCgCXAAoAbAAKAFIBCgBtACYBtwFAANsAtwHHAdsA6wAkAZ8BJAGXAT4AtwA+AL8AcwGtAY4A0QBjAa0BfgDRAFQBdAFvAI8ACQFUAQkBdAEjAI8AIwBvAIQBhgGGAdIBowD2AKEAowD5AIYBBwCjABgBWgEyAHUAJwG6ARoBugE0AN4AQQDeALoBuwHeAN8AEwBeAF4AYgFeAH0AYgFyAV4AcgFeAI0AfQCNAB0BugE3AN4AuQG6Ad0A3gDFAPgAAwDFAMMAxQAHAWcB/wAHAf8AZwEZAIIAGQAhACEAggD5AP8ABwAZABIBEwESAbgBLADcACwALQC4AckBEgHJASwA7QDcAO0ALQF/ASwBLQFGAEcARwCcAC0BcAFwAX8BiwCcAEcAiwBfAdEBegD1AJwB0QFfAZwBegC8ALwA9QAHAdMBIQD3APsAhQH7AHABFQCLABUAogB2AYIBfAGCAZkAnwCRAJ8AfAGBAZkAngB6AYoBegF7AZUAlgCVAKkAnAGjAbwAxACPAZwBrgC8AEIBqgFCAbQBXADYAFwAzgCaAbQBugDYAHUBgwF1AYQBkAChAJAAoABGAYkBpABGAaQAiQGkAKcAYQCkAGEApwACAKQAAgBGAQIAYQByAc0BYgHNAX0A8QCNAPEAcgHOAY0A8gCkAAsBAACkACUApAALAAwADAAuAQwASAAMAAwBDAAmAHYBgwGRAKAADAANAA0ADAENACYADQA4AQ0AUgAqASwBRABGAAUBCQEfACMABQG+AR8A4gB9AYEBmgCeAEoBqQFlAM0AhwGqAaUAzgBjAaQBfgDGAKQBtQHGANkARwGJAWIApwC2AckBtgG4AdoA3ADaAO0AWAG4AXMA3ABVAWoBcACFAFUBzwFqAc8BhQDzAHAA8wDJAc0BywHNAckBywHtAO8A7wDxAO0A8QDKAcsB7gDvAGwBrgGHANIAngHPAY4BzwGtAPMAvgDzAAYBrAFxAawBjADQACAA0AASAc0BLADxADwBkwE9AZMBVwCzAFYAswA9AZIBVwCyADsBlAE8AZQBVgC0AFUAtAA6AZUBOwGVAVUAtQBUALUAOQGWAToBlgFUALYAUwC2AJYBpQGiAaUBwgDJALYAyQBuAZEBQwGRAV0AsQCJALEAQwFpAWkBkQGEALEAXQCEADIBlwEyAZgBTAC4AEwAtwAyAZkBTAC5ACMBmQE9ALkAHwGZAR8BmgE5ALoAOQC5AJoBsAG6ANQAoAGrAcAAzwCbAaABuwDAAHABdAGLAI8AdAF/AY8AnAC2AcsB2gDvADUBywFPAO8AbgF4AYkAkwB4AZEBkwCxAAEABAABABMBAQAtAAYBpQEgAMkAJgFmAUAAgQCgAbMBwADXAKABsQGxAbMB1QDXAMAA1QAhAbcBIQHHATsA6wA7ANsAIQGIATsApgBGAc4BYQDyAEYBcgFhAI0AAgByAQIAjQACAF4AMQHHATEBzAFLAPAASwDrACEBMQE7AEsAUwHAAVMBwQFuAOUAbgDkAP4AwQEYAOUA/wC+Af8ABQEZAB8AGQDiAP4AwgEYAOYA/QDCARcA5gD9AMMBFwDnAPwAwwEWAOcA/ADEARYA6AAAAcQBGgDoAFUBxAFwAOgAVQHFAXAA6QCeAdABnQGeAb0AvgC+APQAzwHQAfMA9AAeAZ0BHgG5ATgA3QA4AL0AHgG6ATgA3gACAboBHADeAAIBuwEcAN8AAQG7ARsA3wADAbsBAwG8AR0A4AAdAN8ABAG8AR4A4AAEAb0BHgDhAL0B0wHhAPcA+gA1ATUBygFPAO4AFABPACIBMQExAYgBIgGIATwApgBLAKYAPABLADEBSAFLAGMAeAGxAZEBsQGxANUAkwDVAJEBswGxANcAIgE1ATwATwB4AaABkwDAAMUBzwHpAPMAxQHQAekA9ABlAdABgAD0AGUB0QGAAPUAVwGcAVcB0QFyAPUAcgC8AFcBjwGPAbUBrgDZAHIArgBoAbgBaAFrAYMAhgCDANwApAHIAY8BpAGuAMYAxgDsAGsBpAGGAMYAIAGRASABaQE6AIQAOgCxAAkBfwEjAJwA+QBTAf8AUwEZAG4ABwBuAP8AwAEZAOQADQA9AQ0ADgANAFcAOAE9AVIAVwA4AZIBUgCyADcBkgFRALIANwE+AVEAWAA2AT4BUABYADYBRAFQAF8A";
  // World Atlas 110m geometry derived from Natural Earth country boundaries.
  const EARTH_OUTLINE_DATA = "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";
  const EARTH_FILL_DATA = "+OSY6jjmmOq449jr+OTY67jo2Ou44xjt+OQY7bjjWO745FjueEFY7rhCWO6445jv+OSY7zjmmO/4Q5jvuOPY8Pjk2PA45tjweOfY8DhF2PC44xjy+OQY8jjmGPJ45xjyuOgY8jg2GPJ4NxjyuDgY8vg5GPL4Qxjy+ORY8zjmWPN451jzuOhY8/jpWPM461jz+AdY8zgJWPN4CljzeC1Y87guWPP4L1jz+DRY8zg2WPN4N1jzuDhY8/g5WPM4O1jz+OSY9DjmmPR455j0uOiY9PjpmPQ465j0eOyY9LgGmPT4B5j0OAmY9HgKmPS4C5j0eC2Y9LgumPT4L5j0ODGY9HgymPS4M5j0+DSY9Dg2mPR4N5j0uDiY9Pg5mPQ4O5j0+OTY9Tjm2PV459j1uOjY9fjp2PU469j1eOzY9bgG2PX4B9j1OAnY9XgK2PW4C9j1eC3Y9bgu2PX4L9j1ODHY9Xgy2PW4M9j1+DTY9Tg22PV4N9j1uDjY9fg52PU4O9j1+OQY9zjmGPd45xj3uOgY9/jpGPc46xj3eOwY97jtGPf47hj3uAYY9/gHGPc4CRj3eAoY97gLGPf4DBj3+BEY93gtGPe4Lhj3+C8Y9zgxGPd4Mhj3uDMY9/g0GPc4Nhj3eDcY97g4GPf4ORj3+ORY+DjmWPh451j4uOhY+PjpWPg461j4eOxY+LjtWPj47lj4OPBY+HgFWPi4Blj4+AdY+DgJWPh4Clj4uAtY+PgMWPj4EVj4+C9Y+DgxWPh4Mlj4uDNY+Pg0WPg4Nlj4eDdY+Lg4WPi445j5+OSY+TjmmPl455j5uOiY+fjpmPk465j5eOyY+bjtmPn47pj5OPCY+XgFmPm4Bpj5+AeY+TgJmPl4Cpj5uAuY+fgMmPk4Dpj5eA+Y+fgRmPk4E5j5ODGY+XgymPm4M5j5+DSY+Xg3mPm4OJj5eEGY+Xji2Pq449j6+OTY+jjm2Pp459j6uOjY+vjp2Po469j6eOzY+rjt2Pr47tj6OPDY+ngF2Pq4Btj6+AfY+jgJ2Pp4Ctj6uAvY+vgM2Po4Dtj6eA/Y+jgT2Pq4M9j6+DTY+ng32Pp44hj8uOMY/PjkGPw45hj8eOcY/LjoGPz46Rj8OOsY/HjsGPy47Rj8+O4Y/DjwGPx48Rj8eAUY/LgGGPz4Bxj8OAkY/HgKGPy4Cxj8+AwY/DgOGPx4Dxj8+DkY/DjhWP144lj9uONY/fjkWP045lj9eOdY/bjoWP346Vj9OOtY/XjsWP247Vj9+O5Y/TjwWP148Vj9eAVY/bgGWP34B1j9OAlY/XgKWP24C1j9+AxY/TgOWP24KVj9ODZY/Xg3WP24OFj9OOGY/njimP6445j++OSY/jjmmP5455j+uOiY/vjpmP4465j+eOyY/rjtmP747pj+OPCY/jgEmP54BZj+uAaY/vgHmP44CZj+eAqY/rgLmP74DJj+OA6Y/ngPmP54KJj+uC6Y/vg0mP44Npj+eDeY/jjh2P944tj/uOPY//jk2P845tj/eOfY/7jo2P/46dj/OOvY/3js2P84BNj/eAXY/7gG2P/4B9j/OAnY/3gK2P+4C9j/+AzY/zgO2P94D9j/OCfY//gq2P84LNj/eC3Y/7gz2P944hgBuOMYAfjkGAE45hgBeOcYAbjoGAH46RgBOOsYATgEGAF4BRgBuAYYAfgHGAE4CRgBeAoYAbgLGAH4DBgBOA4YAXgPGAG4EBgB+BEYATgsGAF4LRgBeOJYArjjWAL45FgCOOZYAnjnWAK46FgCuPxYAvj9WAI4/1gCeABYAvgCWAI4BFgCeAVYArgGWAL4B1gCOAlYAngKWAK4C1gC+AxYAjgOWAJ4D1gCuBBYAvgRWAI4J1gCeC1YAjjhmAN44pgDuOOYA/jkmAM45pgDeOeYA3j7mAO4/JgD+P2YAzj/mAN4AJgDuAGYA/gCmAM4BJgDeAWYA7gGmAP4B5gDOAmYA3gKmAO4C5gD+AyYAzgOmAN4D5gDuBCYA/gRmAM4E5gDeB6YAzgxmAO43tgEOPrYBHj72AS4/NgE+P3YBDj/2AR4ANgEuAHYBPgC2AQ4BNgEeAXYBLgG2AT4B9gEOAnYBHgK2AS4C9gE+AzYBDgO2AR4D9gEuBDYBHge2AR4KNgEuCnYBDjcGAZ43RgGuN4YBjj6GAZ4+xgGuPwYBvj9GAY4/xgGeAAYBrgBGAb4AhgGOAQYBngFGAa4BhgG+AcYBjgJGAZ4ChgGuAsYBvgMGAY4DhgGeA8YBrgQGAb4ERgGOBMYBjgdGAZ4HhgGOCcYBngoGAa4KRgGeNhYB7jZWAc43FgHeN1YB7jjWAf45FgHOPpYB3j7WAe4/FgH+P1YBzj/WAd4AFgHuAFYB/gCWAc4BFgHeAVYB7gGWAf4B1gHOAlYB3gKWAe4C1gH+AxYBzgOWAe4EFgH+BFYBzgTWAd4FFgHuBVYBzgdWAd4HlgHuB9YB/ggWAe4JFgH+CVYBzgnWAd4KFgH+CpYBzjXmAh42JgIuNmYCDjhmAg4+pgIePuYCLj8mAj4/ZgIOP+YCHgAmAi4AZgI+AKYCDgEmAh4BZgIuAaYCPgHmAg4CZgIeAqYCLgLmAj4DJgIOA6YCHgPmAi4EJgI+BGYCDgTmAh4FJgIuBWYCPgWmAj4G5gIOB2YCHgemAi4H5gI+CCYCDgimAi4JJgI+CWYCDgnmAh4KJgIuCmYCPgqmAj41dgJONfYCXjY2Am42dgJOPrYCXj72Am4/NgJ+P3YCTj/2Al4ANgJuAHYCfgC2Ak4BNgJeAXYCbgG2An4B9gJOAnYCXgK2Am4C9gJ+AzYCXgP2Am4ENgJ+BHYCTgT2Am4FdgJOBjYCbga2An4G9gJOB3YCXge2Am4H9gJ+CDYCTgi2Al4I9gJuCTYCfgl2Ak4J9gJeCjYCbgp2An4KtgJOCzYCXgt2Al40xgLuNQYC/jVGAs41xgLeNgYC7jZGAv43xgLuPwYC/j9GAs4/xgLeAAYC7gBGAv4AhgLOAQYC3gFGAu4BhgL+AcYCzgJGAt4ChgLuAsYC/gMGAs4DhgLeA8YC7gQGAv4ERgLeBQYC7gVGAv4FhgLOBgYC3gZGAu4GhgL+BsYCzgdGAt4HhgLuB8YC/ggGAs4IhgLeCMYC7gkGAv4JRgLOCcYC3goGAu4KRgL+CoYCzgsGAt4LRgLuC4YC3jTWAy41FgM+NVYDDjXWAx42FgMuNlYDPjaWAw43FgMeN1YDLjeWAz431gMuPxYDPj9WAw4/1gMeABYDLgBWAz4AlgMOARYDHgFWAz4B1gMOAlYDDgOWAx4D1gMuBBYDPgRWAw4E1gMeBRYDLgVWAz4FlgMOBhYDHgZWAy4GlgM+BtYDDgdWAx4HlgMuB9YDPggWAw4IlgMeCNYDLgkWAz4JVgMOCdYDHgoWAy4KVgM+CpYDDgsWAx4LVgMuC5YDPjQmA040pgNeNOYDbjUmA341ZgNONeYDXjYmA242ZgN+NqYDTjcmA143ZgNuN6YDfjfmA044ZgN+P2YDTj/mA14AJgNuAGYDfgCmA34DJgNOA6YDXgPmA24EJgN+BGYDTgTmA14FJgNuBWYDfgWmA04GJgNeBmYDbgamA34G5gNOB2YDXgemA24H5gN+CCYDTgimA14I5gNuCSYDfglmA04J5gNeCiYDbgpmA34KpgNOCyYDXgtmA24M5gN+DSYDTg2mA340NgOONLYDnjT2A641NgO+NXYDjjX2A542NgOuNnYDvja2A443NgOeN3YDrje2A7439gOOOHYDnji2A64/NgO+P3YDjj/2A54BdgOOAnYDngK2A64C9gO+AzYDjgO2A54D9gOuBDYDvgR2A64FdgO+BbYDjgY2A54GdgOuBrYDvgb2A44HdgOeB7YDrgf2A74INgOOCLYDngj2A64JNgO+CXYDjgn2A54KNgOuCnYDvgq2A44LNgOeC3YDjgx2A64zxgQ+NAYEDjSGBB40xgQuNQYEPjVGBA41xgQeNgYELjZGBD42hgQONwYEHjdGBC43hgQ+N8YEDjhGBB44hgQuPwYEPj9GBA4/xgQeAAYEHgFGBD4BxgQOAkYEHgKGBD4DBgQOA4YELgQGBD4ERgQuBUYEPgWGBA4GBgQeBkYELgaGBD4GxgQOB0YEHgeGBC4HxgQ+CAYEDgiGBB4IxgQuCQYEPglGBA4JxgQeCgYELgpGBD4KhgQOCwYEHgtGBC4LhgQ+C8YEDgxGBB4MhgQuM9YEfjQWBE40lgReNNYEbjUWBH41VgRONdYEXjYWBG42VgR+NpYETjcWBF43VgRuN5YEfjfWBE44VgReOJYEbjjWBH45FgROOZYEXgAWBG4AVgR+AJYETgEWBG4BlgR+AdYETgJWBF4ClgReBRYEbgVWBH4FlgROBhYEXgZWBG4GlgR+BtYETgdWBF4HlgRuB9YEfggWBE4IlgReCNYEbgkWBH4JVgROCdYEXgoWBG4KVgR+CpYETgsWBF4LVgRuC5YEfgvWBE4MVgReDJYEXg3WBG4z5gS+NCYEjjSmBJ405gSuNSYEvjVmBI415gSeNiYErjZmBL42pgSONyYEnjdmBK43pgS+N+YEjjhmBJ44pgSuOOYEvjkmBI45pgSOOuYEjj/mBJ4AJgSuAGYEvgCmBI4BJgSeAWYErgGmBL4B5gSOAmYEngKmBK4C5gS+AyYEjgOmBI4E5gSeBSYErgVmBL4FpgSOBiYEngZmBK4GpgS+BuYEjgdmBJ4HpgSuB+YEvggmBI4IpgSeCOYErgkmBL4JZgSOCeYEngomBK4KZgS+CqYEjgsmBJ4LZgSuC6YEvgvmBI4MZgSeDKYErgzmBJ4N5gSeM7YE7jP2BP40NgTONLYE3jT2BO41NgT+NXYEzjX2BN42NgTuNnYE/ja2BM43NgTeN3YE7je2BP439gTOOHYE3ji2BO449gT+OTYEzjm2BN459gTuOjYE/jp2BM4/9gTuAHYE/gC2BM4BNgTeAXYE7gG2BP4B9gTOAnYE3gK2BO4C9gT+AzYEzgT2BN4FNgT+BbYEzgY2BN4GdgTuBrYE/gb2BM4HdgTeB7YE7gf2BM4J9gTuC7YE/gv2BM4MdgT+MsYFTjNGBV4zhgVuM8YFfjQGBU40hgVeNMYFbjUGBX41RgVONcYFXjYGBW42RgV+NoYFTjcGBV43RgVuN4YFTjhGBV44hgVuOMYFfjkGBU45hgVeOcYFbjoGBW4/BgVOP8YFTgEGBW4BhgV+AcYFTgJGBV4ChgVuAsYFTgYGBV4GRgVuBoYFfgbGBX4y1gWOM1YFnjOWBa4z1gW+NBYFjjSWBZ401gWuNRYFvjVWBY411gWeNhYFrjZWBb42lgWeOJYFrjjWBb45FgWOOZYFnjnWBb4/VgWeAVYFngKWBa4wJgX+MGYFzjDmBd4xJgXuMWYFzjImBd4yZgXuMqYF/jLmBc4zZgXeM6YF7jPmBf40JgXONKYF3jTmBe41JgX+NWYFzjXmBd42JgXuNmYF/jamBd44pgXuOOYF/jumBf4ApgXOASYF3gFmBe4BpgXOAmYF/i82Bj4wdgYOMPYGHjE2Bi4xdgY+MbYGDjI2Bh4ydgYuMrYGPjL2Bg4zdgYeM7YGLjP2Bj40NgYONLYGHjT2Bi41NgY+NXYGDjX2Bh42NgYuNnYGPja2Bg43NgYuN7YGPjf2Bj45NgYOObYGHjs2Bi47dgY+O7YGDgE2Bh4BdgYuAbYGDgJ2Bh4CtgYuAvYGLjAGBr4wRgaOMMYGnjEGBq4xRga+MYYGjjIGBp4yRgauMoYGvjLGBo4zRgaeM4YGrjPGBr40BgaONIYGnjTGBq41Bga+NUYGjjXGBp42BgauNkYGvjaGBo43BgaeN0YGrjeGBq44xga+OQYGjjmGBp45xgaOOsYGnjsGBq47Rga+O4YGjjwGBp48RgaeAUYGrgGGBr4BxgaOAkYGngKGBq4wFgb+MFYGzjDWBt4xFgbuMVYG/jGWBs4zVgbeM5YG3jTWBu41Fgb+NVYGzjXWBt42FgbuNlYG/jaWBv431gbeOJYG7jjWBv45FgbOOtYG3jsWBu47Vgb+O5YGzjwWBt48VgbuPJYG/jzWBs49VgbePZYG/gHWBs4CVgbeApYG7gLWBu4z5gc+NCYHDjSmBz41ZgceNiYHLjZmBz42pgceN2YHPjfmBw44ZgcOOuYHHjsmBy47Zgc+O6YHDjwmBx48ZgcuPKYHPjzmBw49ZgcePaYHLgVmBz40NgduNnYHfja2B043NgduN7YHfjf2B345NgdOObYHXjn2B246Ngd+OnYHTjr2B147NgduO3YHfju2B048NgdePHYHbjy2B3489gdOPXYHXj22B2499gdeBnYHbga2B342hgfONwYH3jdGB+43hgf+N8YHzjhGB944hgfeOcYH7joGB/46RgfOOsYH3jsGB+47Rgf+O4YHzjwGB948RgfuPIYH/jzGB849RgfePYYH7j3GB84BBgfeAUYH7gGGB/4BxgfOAkYH7gkGB/4JRgf";

  function decodeBase64Bytes(encoded) {
    const binary = window.atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function decodeCanonicalFaceVertices() {
    const bytes = decodeBase64Bytes(FACE_VERTEX_DATA);
    const view = new DataView(bytes.buffer);
    const vertices = [];
    for (let offset = 0; offset < bytes.length; offset += 6) {
      vertices.push([
        view.getInt16(offset, true) / 1000,
        view.getInt16(offset + 2, true) / 1000,
        view.getInt16(offset + 4, true) / 1000
      ]);
    }
    return vertices;
  }

  function decodeCanonicalFaceEdges() {
    const bytes = decodeBase64Bytes(FACE_EDGE_DATA);
    const view = new DataView(bytes.buffer);
    const edges = [];
    for (let offset = 0; offset < bytes.length; offset += 4) {
      edges.push([
        view.getUint16(offset, true),
        view.getUint16(offset + 2, true)
      ]);
    }
    return edges;
  }

  function decodeLonLatPoints(encoded) {
    const bytes = decodeBase64Bytes(encoded);
    const view = new DataView(bytes.buffer);
    const points = [];
    for (let offset = 0; offset < bytes.length; offset += 4) {
      points.push([
        view.getInt16(offset, true) / 100,
        view.getInt16(offset + 2, true) / 100
      ]);
    }
    return points;
  }

  const canonicalFaceVertices = decodeCanonicalFaceVertices();
  const canonicalFaceEdges = decodeCanonicalFaceEdges();
  const earthOutlinePoints = decodeLonLatPoints(EARTH_OUTLINE_DATA);
  const earthFillPoints = decodeLonLatPoints(EARTH_FILL_DATA);

  const states = [
    {
      name: "AI & SOCIETY",
      maxPoints: 2400,
      draw: drawMediaPipeAiState
    },
    {
      name: "CLIMATE CHANGE COMMUNICATION",
      maxPoints: 2800,
      draw: drawGeographicEarthState
    },
    {
      name: "COMPUTATIONAL METHODS",
      maxPoints: 2200,
      draw: drawCommunityNetworkState
    }
  ];

  const particles = [];
  let width = 0;
  let height = 0;
  let ratio = 1;
  let targets = [];
  let stateIndex = 0;
  let animationFrame = 0;
  let cycleTimer = 0;
  let resizeTimer = 0;
  let transitionStamp = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    ratio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    maskCanvas.width = Math.max(1, Math.round(width));
    maskCanvas.height = Math.max(1, Math.round(height));
  }

  function resetMask() {
    maskCtx.setTransform(1, 0, 0, 1, 0, 0);
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.lineCap = "round";
    maskCtx.lineJoin = "round";
    maskCtx.fillStyle = "#ffffff";
    maskCtx.strokeStyle = "#ffffff";
  }

  function collectMaskPoints(options = {}) {
    const {
      step = 8,
      threshold = 20,
      jitter = 0.6,
      color = palette.white,
      size = 1,
      depth = 1,
      charPattern = "alternate",
      limit = Infinity
    } = options;
    const data = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const points = [];

    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const alpha = data[(Math.floor(y) * maskCanvas.width + Math.floor(x)) * 4 + 3];
        if (alpha > threshold) {
          const patternIndex = Math.round(x / step) + Math.round(y / step);
          let char = "0";
          if (charPattern === "alternate") {
            char = patternIndex % 2 === 0 ? "0" : "1";
          } else if (charPattern === "vertical") {
            char = Math.round(y / step) % 2 === 0 ? "1" : "0";
          } else if (charPattern === "horizontal") {
            char = Math.round(x / step) % 2 === 0 ? "1" : "0";
          } else if (charPattern === "ones") {
            char = "1";
          } else if (charPattern === "zeros") {
            char = "0";
          }

          points.push({
            x: x + random(-jitter, jitter),
            y: y + random(-jitter, jitter),
            color,
            size,
            depth,
            char
          });

          if (points.length >= limit) {
            return points;
          }
        }
      }
    }

    return points;
  }

  function layer(draw, options) {
    resetMask();
    draw();
    return collectMaskPoints(options);
  }

  function shuffle(points) {
    for (let i = points.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }
    return points;
  }

  function landmarkFaceWidth(y) {
    const profile = [
      [-166, 54],
      [-136, 91],
      [-96, 108],
      [-48, 114],
      [0, 112],
      [42, 104],
      [82, 88],
      [116, 62],
      [142, 28]
    ];

    if (y <= profile[0][0]) return profile[0][1];
    if (y >= profile[profile.length - 1][0]) return profile[profile.length - 1][1];

    for (let i = 0; i < profile.length - 1; i += 1) {
      const [y1, width1] = profile[i];
      const [y2, width2] = profile[i + 1];
      if (y >= y1 && y <= y2) {
        const t = (y - y1) / (y2 - y1);
        const smooth = t * t * (3 - 2 * t);
        return width1 + (width2 - width1) * smooth;
      }
    }

    return 0;
  }

  function landmarkSurfaceDepth(x, y) {
    const halfWidth = landmarkFaceWidth(y);
    if (halfWidth <= 0 || Math.abs(x) > halfWidth) return null;

    const normalizedX = x / halfWidth;
    let z = 38 * Math.sqrt(Math.max(0, 1 - normalizedX * normalizedX));
    z += Math.exp(-(x * x) / 150) * Math.exp(-((y - 2) ** 2) / 3800) * 30;
    z += Math.exp(-(x * x) / 130) * Math.exp(-((y - 30) ** 2) / 250) * 22;
    z -= Math.exp(-((Math.abs(x) - 43) ** 2) / 300) * Math.exp(-((y + 33) ** 2) / 220) * 9;
    return z;
  }

  function samplePolyline3D(vertices, spacing, callback) {
    for (let segment = 0; segment < vertices.length - 1; segment += 1) {
      const a = vertices[segment];
      const b = vertices[segment + 1];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(distance / spacing));

      for (let i = segment === 0 ? 0 : 1; i <= steps; i += 1) {
        const t = i / steps;
        callback(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          (a.z || 0) + ((b.z || 0) - (a.z || 0)) * t,
          segment + t
        );
      }
    }
  }

  function wrapLongitudeDelta(a, b) {
    let d = a - b;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return d;
  }

  function geoOval(lon, lat, centerLon, centerLat, rx, ry) {
    const dx = wrapLongitudeDelta(lon, centerLon) / rx;
    const dy = (lat - centerLat) / ry;
    return dx * dx + dy * dy <= 1;
  }

  function isAmericasLand(lon, lat) {
    return (
      geoOval(lon, lat, -105, 50, 34, 22) ||
      geoOval(lon, lat, -95, 27, 26, 15) ||
      geoOval(lon, lat, -74, 18, 10, 7) ||
      geoOval(lon, lat, -43, 72, 18, 10) ||
      geoOval(lon, lat, -63, -14, 24, 34) ||
      geoOval(lon, lat, -74, -40, 10, 20)
    );
  }

  function drawMediaPipeAiState() {
    const scale = Math.min(width, height) / 36;
    const depthScale = scale * 1.12;
    const cx = width * 0.54;
    const cy = height * 0.47;
    const centerY = -0.676;
    const centerZ = 4.159;
    const points = [];
    let glyphIndex = 0;

    function addFacePoint(x3, y3, z3, options = {}) {
      const {
        color = palette.cyan,
        size = 0.72,
        feature = "faceEdge",
        scan = false,
        scanU = 0
      } = options;

      points.push({
        x: cx + x3,
        y: cy + y3,
        color,
        size,
        depth: 1,
        char: glyphIndex++ % 2 === 0 ? "0" : "1",
        model: "mediapipeFace",
        anchorX: cx,
        anchorY: cy,
        x3,
        y3,
        z3,
        modelScale: scale,
        feature,
        scan,
        scanU,
        visibility: 1
      });
    }

    canonicalFaceVertices.forEach(([x, y, z], index) => {
      const normalizedDepth = clamp((z + 2.436) / 10.023, 0, 1);
      const color = normalizedDepth > 0.72
        ? palette.white
        : normalizedDepth > 0.42
          ? palette.ice
          : palette.cyan;
      addFacePoint(
        x * scale,
        -(y - centerY) * scale,
        (z - centerZ) * depthScale,
        {
          color,
          size: normalizedDepth > 0.72 ? 0.9 : 0.72,
          feature: "faceVertex"
        }
      );
    });

    canonicalFaceEdges.forEach(([aIndex, bIndex]) => {
      const a = canonicalFaceVertices[aIndex];
      const b = canonicalFaceVertices[bIndex];
      if (!a || !b) return;
      const x = (a[0] + b[0]) * 0.5;
      const y = (a[1] + b[1]) * 0.5;
      const z = (a[2] + b[2]) * 0.5;
      const normalizedDepth = clamp((z + 2.436) / 10.023, 0, 1);
      addFacePoint(
        x * scale,
        -(y - centerY) * scale,
        (z - centerZ) * depthScale,
        {
          color: normalizedDepth > 0.66 ? palette.ice : palette.teal,
          size: 0.56,
          feature: "faceEdge"
        }
      );
    });

    for (let i = 0; i <= 30; i += 1) {
      addFacePoint(0, 0, 0, {
        color: palette.white,
        size: i % 5 === 0 ? 0.92 : 0.66,
        feature: "scanner",
        scan: true,
        scanU: -0.96 + (i / 30) * 1.92
      });
    }

    return points;
  }

  function drawAiState() {
    const scale = Math.min(width, height) / 720;
    const cx = width * 0.54;
    const cy = height * 0.47;
    const points = [];
    let glyphIndex = 0;

    function addGlyph(x, y, z, options = {}) {
      const {
        color = palette.cyan,
        size = 0.8,
        feature = "mesh",
        scan = false,
        scanU = 0
      } = options;

      points.push({
        x: cx + x * scale,
        y: cy + y * scale,
        color,
        size,
        depth: 1,
        char: glyphIndex++ % 2 === 0 ? "0" : "1",
        model: "biometricHead",
        anchorX: cx,
        anchorY: cy,
        x3: x * scale,
        y3: y * scale,
        z3: z * scale,
        modelScale: scale,
        feature,
        scan,
        scanU,
        visibility: 1
      });
    }

    function addPath(vertices, options = {}, closed = false) {
      const path = closed ? [...vertices, vertices[0]] : vertices;
      samplePolyline3D(path, options.spacing || 7, (x, y, z) => addGlyph(x, y, z, options));
    }

    function point(x, y, z, feature = "mesh") {
      return { x, y, z, feature };
    }

    const n = {
      crown: point(0, -160, 10, "contour"),
      crownL1: point(-34, -157, 10, "contour"),
      crownL2: point(-67, -145, 9, "contour"),
      templeUpperL: point(-94, -120, 7, "contour"),
      templeL: point(-109, -88, 5, "contour"),
      earTopL: point(-114, -48, 3, "contour"),
      earMidL: point(-115, -8, 2, "contour"),
      earBottomL: point(-108, 30, 4, "contour"),
      jawL1: point(-98, 65, 7, "contour"),
      jawL2: point(-82, 89, 10, "contour"),
      jawL3: point(-61, 111, 13, "contour"),
      jawL4: point(-34, 128, 16, "contour"),
      chin: point(0, 136, 20, "contour"),
      jawR4: point(34, 128, 16, "contour"),
      jawR3: point(61, 111, 13, "contour"),
      jawR2: point(82, 89, 10, "contour"),
      jawR1: point(98, 65, 7, "contour"),
      earBottomR: point(108, 30, 4, "contour"),
      earMidR: point(115, -8, 2, "contour"),
      earTopR: point(114, -48, 3, "contour"),
      templeR: point(109, -88, 5, "contour"),
      templeUpperR: point(94, -120, 7, "contour"),
      crownR2: point(67, -145, 9, "contour"),
      crownR1: point(34, -157, 10, "contour"),

      foreheadL2: point(-68, -114, 18),
      foreheadL1: point(-34, -121, 28),
      foreheadC: point(0, -123, 34),
      foreheadR1: point(34, -121, 28),
      foreheadR2: point(68, -114, 18),

      browLO: point(-78, -68, 27, "brow"),
      browLM: point(-53, -78, 37, "brow"),
      browLI: point(-20, -69, 47, "brow"),
      browRI: point(20, -69, 47, "brow"),
      browRM: point(53, -78, 37, "brow"),
      browRO: point(78, -68, 27, "brow"),

      eyeLO: point(-76, -39, 27, "eye"),
      eyeLT: point(-54, -51, 37, "eye"),
      eyeLI: point(-24, -40, 50, "eye"),
      eyeLB: point(-53, -29, 35, "eye"),
      eyeRI: point(24, -40, 50, "eye"),
      eyeRT: point(54, -51, 37, "eye"),
      eyeRO: point(76, -39, 27, "eye"),
      eyeRB: point(53, -29, 35, "eye"),

      noseTop: point(0, -66, 58, "nose"),
      noseMid: point(0, -24, 70, "nose"),
      noseLow: point(0, 14, 80, "nose"),
      noseTip: point(0, 38, 88, "nose"),
      noseWingL: point(-25, 43, 61, "nose"),
      nostrilL: point(-12, 48, 72, "nose"),
      nostrilR: point(12, 48, 72, "nose"),
      noseWingR: point(25, 43, 61, "nose"),

      underEyeL: point(-50, -6, 34),
      underEyeR: point(50, -6, 34),
      cheekOuterL: point(-87, 28, 18),
      cheekL: point(-58, 42, 36),
      cheekR: point(58, 42, 36),
      cheekOuterR: point(87, 28, 18),
      lowerCheekL: point(-69, 76, 28),
      lowerCheekR: point(69, 76, 28),

      philtrum: point(0, 67, 61, "mouth"),
      mouthL: point(-41, 84, 38, "mouth"),
      upperLipL: point(-21, 80, 51, "mouth"),
      cupid: point(0, 84, 58, "mouth"),
      upperLipR: point(21, 80, 51, "mouth"),
      mouthR: point(41, 84, 38, "mouth"),
      lowerLipR: point(22, 95, 48, "mouth"),
      lowerLipC: point(0, 98, 53, "mouth"),
      lowerLipL: point(-22, 95, 48, "mouth"),
      innerL: point(-22, 87, 52, "mouth"),
      innerC: point(0, 89, 56, "mouth"),
      innerR: point(22, 87, 52, "mouth")
    };

    const frontOutline = [
      n.crown, n.crownL1, n.crownL2, n.templeUpperL, n.templeL, n.earTopL,
      n.earMidL, n.earBottomL, n.jawL1, n.jawL2, n.jawL3, n.jawL4,
      n.chin, n.jawR4, n.jawR3, n.jawR2, n.jawR1, n.earBottomR,
      n.earMidR, n.earTopR, n.templeR, n.templeUpperR, n.crownR2,
      n.crownR1, n.crown
    ];
    addPath(frontOutline, { spacing: 5.5, color: palette.white, size: 1.02, feature: "contour" });

    const rearOutline = frontOutline.map((vertex) => point(
      vertex.x * 0.88,
      vertex.y + 2,
      -48,
      "rearShell"
    ));
    addPath(rearOutline, {
      spacing: 7,
      color: palette.teal,
      size: 0.58,
      feature: "rearShell"
    });

    [0, 3, 5, 8, 12, 16, 19, 21].forEach((outlineIndex) => {
      addPath([frontOutline[outlineIndex], rearOutline[outlineIndex]], {
        spacing: 8,
        color: palette.teal,
        size: 0.58,
        feature: "depthConnector"
      });
    });

    const featurePaths = [
      [[n.browLO, n.browLM, n.browLI], { color: palette.ice, size: 0.92, feature: "brow" }],
      [[n.browRI, n.browRM, n.browRO], { color: palette.ice, size: 0.92, feature: "brow" }],
      [[n.eyeLO, n.eyeLT, n.eyeLI, n.eyeLB], { color: palette.white, size: 1.04, feature: "eye" }, true],
      [[n.eyeRI, n.eyeRT, n.eyeRO, n.eyeRB], { color: palette.white, size: 1.04, feature: "eye" }, true],
      [[n.noseTop, n.noseMid, n.noseLow, n.noseTip], { color: palette.white, size: 1, feature: "nose" }],
      [[n.noseWingL, n.nostrilL, n.noseTip, n.nostrilR, n.noseWingR], { color: palette.ice, size: 0.96, feature: "nose" }],
      [[n.mouthL, n.upperLipL, n.cupid, n.upperLipR, n.mouthR, n.lowerLipR, n.lowerLipC, n.lowerLipL], { color: palette.white, size: 0.98, feature: "mouth" }, true],
      [[n.innerL, n.innerC, n.innerR], { color: palette.ice, size: 0.86, feature: "mouth" }]
    ];
    featurePaths.forEach(([vertices, options, closed = false]) => addPath(vertices, options, closed));

    const meshPaths = [
      [n.templeUpperL, n.foreheadL2, n.foreheadL1, n.foreheadC, n.foreheadR1, n.foreheadR2, n.templeUpperR],
      [n.crownL2, n.foreheadL2, n.browLO, n.eyeLO, n.cheekOuterL, n.jawL1, n.jawL3],
      [n.crownL1, n.foreheadL1, n.browLM, n.eyeLT, n.underEyeL, n.cheekL, n.lowerCheekL, n.jawL4],
      [n.crown, n.foreheadC, n.noseTop, n.noseMid, n.noseLow, n.noseTip, n.philtrum, n.cupid, n.lowerLipC, n.chin],
      [n.crownR1, n.foreheadR1, n.browRM, n.eyeRT, n.underEyeR, n.cheekR, n.lowerCheekR, n.jawR4],
      [n.crownR2, n.foreheadR2, n.browRO, n.eyeRO, n.cheekOuterR, n.jawR1, n.jawR3],
      [n.templeL, n.browLO, n.browLM, n.browLI, n.noseTop, n.browRI, n.browRM, n.browRO, n.templeR],
      [n.earTopL, n.eyeLO, n.eyeLI, n.noseMid, n.eyeRI, n.eyeRO, n.earTopR],
      [n.earMidL, n.cheekOuterL, n.underEyeL, n.noseLow, n.underEyeR, n.cheekOuterR, n.earMidR],
      [n.earBottomL, n.lowerCheekL, n.noseWingL, n.noseTip, n.noseWingR, n.lowerCheekR, n.earBottomR],
      [n.jawL1, n.mouthL, n.upperLipL, n.philtrum, n.upperLipR, n.mouthR, n.jawR1],
      [n.jawL3, n.lowerLipL, n.lowerLipC, n.lowerLipR, n.jawR3]
    ];
    meshPaths.forEach((vertices, index) => {
      addPath(vertices, {
        spacing: index < 6 ? 8 : 9,
        color: index % 3 === 0 ? palette.cyan : palette.teal,
        size: index < 6 ? 0.72 : 0.68,
        feature: "mesh"
      });
    });

    const diagonalPairs = [
      [n.foreheadL2, n.browLM], [n.foreheadL1, n.browLO],
      [n.foreheadR2, n.browRM], [n.foreheadR1, n.browRO],
      [n.eyeLI, n.noseLow], [n.eyeRI, n.noseLow],
      [n.eyeLO, n.cheekL], [n.eyeRO, n.cheekR],
      [n.cheekL, n.noseWingL], [n.cheekR, n.noseWingR],
      [n.noseWingL, n.mouthL], [n.noseWingR, n.mouthR],
      [n.mouthL, n.jawL3], [n.mouthR, n.jawR3]
    ];
    diagonalPairs.forEach((vertices) => {
      addPath(vertices, { spacing: 10, color: palette.teal, size: 0.62, feature: "mesh" });
    });

    [
      n.eyeLO, n.eyeLI, n.eyeRI, n.eyeRO, n.noseTip,
      n.noseWingL, n.noseWingR, n.mouthL, n.mouthR, n.chin
    ].forEach((landmark, index) => {
      addGlyph(landmark.x, landmark.y, landmark.z + 4, {
        color: index === 4 ? palette.white : palette.ice,
        size: index === 4 ? 1.2 : 1.08,
        feature: "landmark"
      });
    });

    for (let i = 0; i <= 24; i += 1) {
      addGlyph(0, 0, 0, {
        color: palette.white,
        size: i % 4 === 0 ? 0.92 : 0.72,
        feature: "scanner",
        scan: true,
        scanU: -0.92 + (i / 24) * 1.84
      });
    }

    return points;
  }

  function drawAmericas(cx, cy, radius) {
    maskCtx.beginPath();
    maskCtx.moveTo(cx - radius * 0.54, cy - radius * 0.52);
    maskCtx.bezierCurveTo(cx - radius * 0.5, cy - radius * 0.72, cx - radius * 0.24, cy - radius * 0.74, cx - radius * 0.08, cy - radius * 0.56);
    maskCtx.bezierCurveTo(cx + radius * 0.02, cy - radius * 0.44, cx + radius * 0.1, cy - radius * 0.22, cx + radius * 0.02, cy - radius * 0.06);
    maskCtx.bezierCurveTo(cx - radius * 0.08, cy + radius * 0.06, cx - radius * 0.18, cy + radius * 0.12, cx - radius * 0.12, cy + radius * 0.22);
    maskCtx.bezierCurveTo(cx - radius * 0.04, cy + radius * 0.34, cx + radius * 0.04, cy + radius * 0.4, cx + radius * 0.06, cy + radius * 0.48);
    maskCtx.bezierCurveTo(cx + radius * 0.08, cy + radius * 0.58, cx + radius * 0.04, cy + radius * 0.72, cx - radius * 0.02, cy + radius * 0.84);
    maskCtx.bezierCurveTo(cx - radius * 0.04, cy + radius * 0.9, cx + radius * 0.02, cy + radius, cx + radius * 0.06, cy + radius * 0.9);
    maskCtx.bezierCurveTo(cx + radius * 0.12, cy + radius * 0.76, cx + radius * 0.16, cy + radius * 0.58, cx + radius * 0.24, cy + radius * 0.36);
    maskCtx.bezierCurveTo(cx + radius * 0.3, cy + radius * 0.2, cx + radius * 0.22, cy + radius * 0.02, cx + radius * 0.1, cy - radius * 0.1);
    maskCtx.bezierCurveTo(cx + radius * 0.02, cy - radius * 0.18, cx - radius * 0.02, cy - radius * 0.34, cx + radius * 0.02, cy - radius * 0.46);
    maskCtx.bezierCurveTo(cx + radius * 0.04, cy - radius * 0.58, cx - radius * 0.04, cy - radius * 0.64, cx - radius * 0.2, cy - radius * 0.64);
    maskCtx.bezierCurveTo(cx - radius * 0.3, cy - radius * 0.66, cx - radius * 0.42, cy - radius * 0.62, cx - radius * 0.54, cy - radius * 0.52);
    maskCtx.closePath();

    maskCtx.moveTo(cx - radius * 0.66, cy - radius * 0.18);
    maskCtx.bezierCurveTo(cx - radius * 0.64, cy - radius * 0.34, cx - radius * 0.56, cy - radius * 0.4, cx - radius * 0.46, cy - radius * 0.28);
    maskCtx.bezierCurveTo(cx - radius * 0.38, cy - radius * 0.18, cx - radius * 0.44, cy - radius * 0.04, cx - radius * 0.56, cy + radius * 0.02);
    maskCtx.bezierCurveTo(cx - radius * 0.68, cy + radius * 0.04, cx - radius * 0.7, cy - radius * 0.06, cx - radius * 0.66, cy - radius * 0.18);
    maskCtx.closePath();

    maskCtx.moveTo(cx + radius * 0.08, cy + radius * 0.02);
    maskCtx.bezierCurveTo(cx + radius * 0.12, cy + radius * 0.04, cx + radius * 0.18, cy + radius * 0.06, cx + radius * 0.18, cy + radius * 0.12);
    maskCtx.bezierCurveTo(cx + radius * 0.18, cy + radius * 0.16, cx + radius * 0.12, cy + radius * 0.18, cx + radius * 0.08, cy + radius * 0.16);
    maskCtx.bezierCurveTo(cx + radius * 0.04, cy + radius * 0.12, cx + radius * 0.04, cy + radius * 0.06, cx + radius * 0.08, cy + radius * 0.02);
    maskCtx.closePath();
  }

  function drawGeographicEarthState() {
    const cx = width * 0.54;
    const cy = height * 0.46;
    const radius = Math.min(width, height) * 0.255;
    const points = [];
    let glyphIndex = 0;

    function addSpherePoint(lon, lat, radiusFactor, options = {}) {
      const {
        color = palette.blue,
        size = 0.7,
        feature = "oceanGrid"
      } = options;
      const longitude = (lon + 82) * Math.PI / 180;
      const latitude = lat * Math.PI / 180;
      const localRadius = radius * radiusFactor;
      const x3 = localRadius * Math.cos(latitude) * Math.sin(longitude);
      const y3 = -localRadius * Math.sin(latitude);
      const z3 = localRadius * Math.cos(latitude) * Math.cos(longitude);

      points.push({
        x: cx + x3,
        y: cy + y3,
        color,
        size,
        depth: 1,
        char: glyphIndex++ % 2 === 0 ? "0" : "1",
        model: "earthGeo",
        anchorX: cx,
        anchorY: cy,
        x3,
        y3,
        z3,
        modelScale: radius,
        feature,
        visibility: 1
      });
    }

    earthFillPoints.forEach(([lon, lat], index) => {
      addSpherePoint(lon, lat, 1.004, {
        color: index % 7 === 0 ? palette.ice : palette.green,
        size: index % 7 === 0 ? 0.72 : 0.58,
        feature: "landFill"
      });
    });

    earthOutlinePoints.forEach(([lon, lat], index) => {
      addSpherePoint(lon, lat, 1.012, {
        color: index % 5 === 0 ? palette.white : palette.green,
        size: index % 5 === 0 ? 0.86 : 0.72,
        feature: "landOutline"
      });
    });

    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -78; lat <= 78; lat += 7) {
        addSpherePoint(lon, lat, 1, {
          color: palette.blue,
          size: 0.54,
          feature: "oceanGrid"
        });
      }
    }

    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 7) {
        addSpherePoint(lon, lat, 1, {
          color: palette.blue,
          size: 0.54,
          feature: "oceanGrid"
        });
      }
    }

    for (let i = 0; i < 180; i += 1) {
      const lon = (i * 137.508) % 360 - 180;
      const lat = Math.asin(-1 + (2 * i) / 179) * 180 / Math.PI;
      addSpherePoint(lon, lat, 1.055, {
        color: palette.ice,
        size: 0.48,
        feature: "atmosphere"
      });
    }

    return points;
  }

  function drawEarthState() {
    const scale = Math.min(width, height) / 560;
    const cx = width * 0.54;
    const cy = height * 0.5;
    const radius = 126 * scale;
    const points = [];

    for (let lat = -78; lat <= 78; lat += 8) {
      const latRad = lat * Math.PI / 180;
      for (let lon = -180; lon < 180; lon += 9) {
        const lonRad = lon * Math.PI / 180;
        const x = radius * Math.cos(latRad) * Math.cos(lonRad);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(lonRad);
        const land = isAmericasLand(lon, lat);
        points.push({
          x: cx + x,
          y: cy + y,
          color: land ? palette.green : palette.blue,
          size: land ? 0.98 : 0.9,
          depth: 0.9 + z / (radius * 2.2),
          char: ((Math.round((lon + 180) / 9) + Math.round((lat + 90) / 8)) % 2 === 0) ? "0" : "1",
          model: "earth3d",
          anchorX: cx,
          anchorY: cy,
          x3: x,
          y3: y,
          z3: z,
          visibility: 1
        });
      }
    }

    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = lat * Math.PI / 180;
      for (let lon = -180; lon < 180; lon += 10) {
        const lonRad = lon * Math.PI / 180;
        points.push({
          x: cx,
          y: cy,
          color: palette.white,
          size: 0.92,
          depth: 1,
          char: "1",
          model: "earth3d",
          anchorX: cx,
          anchorY: cy,
          x3: radius * Math.cos(latRad) * Math.cos(lonRad),
          y3: radius * Math.sin(latRad),
          z3: radius * Math.cos(latRad) * Math.sin(lonRad),
          visibility: 1,
          grid: true
        });
      }
    }

    for (let lon = -120; lon <= 120; lon += 40) {
      const lonRad = lon * Math.PI / 180;
      for (let lat = -80; lat <= 80; lat += 8) {
        const latRad = lat * Math.PI / 180;
        points.push({
          x: cx,
          y: cy,
          color: palette.white,
          size: 0.88,
          depth: 0.98,
          char: "0",
          model: "earth3d",
          anchorX: cx,
          anchorY: cy,
          x3: radius * Math.cos(latRad) * Math.cos(lonRad),
          y3: radius * Math.sin(latRad),
          z3: radius * Math.cos(latRad) * Math.sin(lonRad),
          visibility: 1,
          grid: true
        });
      }
    }

    for (let i = 0; i < 240; i += 1) {
      const lon = -160 + (i % 40) * 8;
      const lat = -70 + Math.floor(i / 40) * 28 + Math.sin(i) * 3;
      const lonRad = lon * Math.PI / 180;
      const latRad = lat * Math.PI / 180;
      points.push({
        x: cx,
        y: cy,
        color: palette.ice,
        size: 0.86,
        depth: 1.04,
        char: i % 2 === 0 ? "0" : "1",
        model: "earth3d",
        anchorX: cx,
        anchorY: cy,
        x3: (radius + 6 * scale) * Math.cos(latRad) * Math.cos(lonRad),
        y3: (radius + 6 * scale) * Math.sin(latRad),
        z3: (radius + 6 * scale) * Math.cos(latRad) * Math.sin(lonRad),
        visibility: 0.9,
        cloud: true
      });
    }

    return points;
  }

  function drawCommunityNetworkState() {
    const cx = width * 0.54;
    const cy = height * 0.47;
    const scale = Math.min(width, height) * 0.34;
    const points = [];
    const nodes = [];
    let glyphIndex = 0;

    const hubLayout = [
      { x: -0.78, y: -0.24, z: 0.05, color: palette.cyan },
      { x: -0.48, y: 0.28, z: -0.14, color: palette.teal },
      { x: -0.12, y: -0.15, z: 0.22, color: palette.blue },
      { x: 0.22, y: 0.2, z: -0.04, color: palette.cyan },
      { x: 0.58, y: -0.2, z: 0.16, color: palette.ice },
      { x: 0.76, y: 0.3, z: -0.22, color: palette.teal },
      { x: -0.08, y: 0.52, z: -0.28, color: palette.blue }
    ];
    const satellitesPerHub = 12;

    function toModelPosition(x, y, z) {
      return {
        x: x * scale * 1.08,
        y: y * scale * 0.86,
        z: z * scale * 0.72
      };
    }

    function addTarget(x3, y3, z3, options = {}) {
      const {
        color = palette.cyan,
        size = 0.66,
        feature = "networkEdge",
        community = 0
      } = options;
      points.push({
        x: cx + x3,
        y: cy + y3,
        color,
        size,
        depth: 1,
        char: glyphIndex++ % 2 === 0 ? "0" : "1",
        model: "communityNetwork",
        anchorX: cx,
        anchorY: cy,
        x3,
        y3,
        z3,
        modelScale: scale,
        feature,
        community,
        visibility: 1
      });
    }

    hubLayout.forEach((hub, community) => {
      nodes.push({
        ...toModelPosition(hub.x, hub.y, hub.z),
        community,
        hub: true,
        color: hub.color
      });
    });

    hubLayout.forEach((hub, community) => {
      for (let i = 0; i < satellitesPerHub; i += 1) {
        const angle = i * 2.399963 + community * 0.71;
        const radial = 0.18 + (i % 5) * 0.035;
        const position = toModelPosition(
          hub.x + Math.cos(angle) * radial,
          hub.y + Math.sin(angle) * radial * 0.76,
          hub.z + Math.sin(angle * 1.57 + community) * 0.12
        );
        nodes.push({
          ...position,
          community,
          hub: false,
          secondary: i % 5 === 0,
          color: hub.color
        });
      }
    });

    function satelliteIndex(hubIndex, satelliteOffset) {
      return hubLayout.length + hubIndex * satellitesPerHub + satelliteOffset;
    }

    function addEdge(aIndex, bIndex, bridge = false, accent = false) {
      const a = nodes[aIndex];
      const b = nodes[bIndex];
      const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
      const steps = Math.max(4, Math.ceil(distance / (bridge ? 9 : 11)));
      for (let i = 1; i < steps; i += 1) {
        const t = i / steps;
        addTarget(
          a.x + (b.x - a.x) * t,
          a.y + (b.y - a.y) * t,
          a.z + (b.z - a.z) * t,
          {
            color: bridge
              ? (accent ? palette.white : palette.ice)
              : (i % 4 === 0 ? palette.ice : a.color),
            size: bridge ? (accent ? 0.56 : 0.49) : 0.42,
            feature: bridge ? "networkBridge" : "networkEdge",
            community: a.community
          }
        );
      }
    }

    hubLayout.forEach((hub, hubIndex) => {
      for (let i = 0; i < satellitesPerHub; i += 1) {
        const current = satelliteIndex(hubIndex, i);
        const next = satelliteIndex(hubIndex, (i + 1) % satellitesPerHub);
        addEdge(hubIndex, current);
        if (i % 2 === 0) addEdge(current, next);
      }
    });

    const hubBackbone = [
      [0, 1], [0, 2], [1, 2], [1, 6], [2, 3],
      [2, 4], [3, 4], [3, 5], [3, 6], [4, 5]
    ];
    hubBackbone.forEach(([a, b], index) => {
      addEdge(a, b, true, index === 3 || index === 5 || index === 7);
    });

    [
      [satelliteIndex(0, 2), satelliteIndex(2, 5)],
      [satelliteIndex(0, 6), satelliteIndex(1, 1)],
      [satelliteIndex(1, 4), satelliteIndex(6, 7)],
      [satelliteIndex(2, 1), satelliteIndex(3, 6)],
      [satelliteIndex(2, 7), satelliteIndex(4, 3)],
      [satelliteIndex(3, 2), satelliteIndex(5, 5)],
      [satelliteIndex(3, 7), satelliteIndex(6, 3)],
      [satelliteIndex(4, 6), satelliteIndex(5, 1)]
    ].forEach(([a, b]) => {
      addEdge(a, b, true);
    });

    nodes.forEach((node, nodeIndex) => {
      addTarget(node.x, node.y, node.z, {
        color: node.hub ? palette.white : (node.secondary ? palette.ice : node.color),
        size: node.hub ? 1.68 : (node.secondary ? 1.4 : 1.2),
        feature: node.hub ? "networkHub" : "networkNode",
        community: node.community
      });

      const ringCount = node.hub ? 6 : 0;
      const ringRadius = 9.5 * (0.96 + (nodeIndex % 3) * 0.05);
      for (let i = 0; i < ringCount; i += 1) {
        const angle = (i / ringCount) * Math.PI * 2;
        addTarget(
          node.x + Math.cos(angle) * ringRadius,
          node.y + Math.sin(angle) * ringRadius,
          node.z + Math.sin(angle * 1.4) * ringRadius * 0.22,
          {
            color: node.color,
            size: 0.62,
            feature: "networkHalo",
            community: node.community
          }
        );
      }
    });

    return points;
  }

  function drawNetworkState() {
    const points = [];
    const scale = Math.min(width, height) / 560;
    const cx = width * 0.53;
    const cy = height * 0.52;

    const hubs = [
      { x: -156, y: 110, z: 120, r: 16 },
      { x: -30, y: 36, z: 46, r: 14 },
      { x: 118, y: 94, z: 110, r: 16 },
      { x: -102, y: -30, z: -8, r: 11 },
      { x: 34, y: -74, z: -56, r: 10 },
      { x: 144, y: -108, z: -112, r: 11 },
      { x: -10, y: -152, z: -164, r: 9 }
    ];

    const majorEdges = [[0,1],[1,2],[3,4],[4,5],[3,1],[4,1],[5,2],[6,3],[6,4],[0,4],[2,4]];
    const minorEdges = [[0,3],[1,4],[2,5],[1,6]];

    function pushEdgePoints(a, b, color, size, stepCount, char) {
      for (let i = 0; i <= stepCount; i += 1) {
        const t = i / stepCount;
        points.push({
          x: cx,
          y: cy,
          color,
          size,
          depth: 0.86,
          char,
          model: "network3d",
          anchorX: cx,
          anchorY: cy,
          x3: (a.x + (b.x - a.x) * t) * scale,
          y3: (a.y + (b.y - a.y) * t) * scale,
          z3: (a.z + (b.z - a.z) * t) * scale,
          visibility: 1,
          edge: true
        });
      }
    }

    majorEdges.forEach(([aIndex, bIndex], edgeIndex) => {
      pushEdgePoints(hubs[aIndex], hubs[bIndex], palette.cyan, 0.86, 16, edgeIndex % 2 === 0 ? "1" : "0");
    });
    minorEdges.forEach(([aIndex, bIndex], edgeIndex) => {
      pushEdgePoints(hubs[aIndex], hubs[bIndex], palette.ice, 0.76, 12, edgeIndex % 2 === 0 ? "0" : "1");
    });

    hubs.forEach((hub, hubIndex) => {
      for (let orbit = 0; orbit < 7; orbit += 1) {
        const angle = -2.4 + orbit * 0.64;
        const radius = (hubIndex < 3 ? 48 : 34) + orbit * 2;
        points.push({
          x: cx,
          y: cy,
          color: orbit % 4 === 0 ? palette.blue : palette.white,
          size: hubIndex < 3 ? 0.9 : 0.78,
          depth: 0.84,
          char: orbit % 2 === 0 ? "0" : "1",
          model: "network3d",
          anchorX: cx,
          anchorY: cy,
          x3: (hub.x + Math.cos(angle) * radius) * scale,
          y3: (hub.y + Math.sin(angle) * radius * 0.58) * scale,
          z3: (hub.z + Math.sin(angle * 1.2) * radius * 0.22) * scale,
          visibility: 1,
          node: true
        });
      }

      points.push({
        x: cx,
        y: cy,
        color: palette.cyan,
        size: 1.22,
        depth: 1.08,
        char: "1",
        model: "network3d",
        anchorX: cx,
        anchorY: cy,
        x3: hub.x * scale,
        y3: hub.y * scale,
        z3: hub.z * scale,
        visibility: 1,
        hub: true
      });
      points.push({
        x: cx,
        y: cy,
        color: palette.white,
        size: 0.9,
        depth: 1.12,
        char: "0",
        model: "network3d",
        anchorX: cx,
        anchorY: cy,
        x3: hub.x * scale,
        y3: hub.y * scale,
        z3: (hub.z + 10) * scale,
        visibility: 1,
        hub: true
      });
    });

    return points;
  }

  function sampleState(index) {
    return shuffle(states[index].draw()).slice(0, states[index].maxPoints || 3200);
  }

  function ensureParticleCount(count) {
    while (particles.length < count) {
      particles.push({
        x: random(width * 0.16, width * 0.84),
        y: random(height * 0.16, height * 0.84),
        tx: width * 0.5,
        ty: height * 0.5,
        vx: 0,
        vy: 0,
        alpha: 0,
        baseAlpha: random(0.74, 0.98),
        depth: random(0.78, 1.18),
        size: random(0.84, 1.08),
        baseSize: 1,
        char: Math.random() > 0.5 ? "1" : "0",
        color: palette.white,
        baseColor: palette.white,
        active: false,
        seed: random(0, Math.PI * 2),
        model: "",
        anchorX: width * 0.5,
        anchorY: height * 0.5,
        x3: 0,
        y3: 0,
        z3: 0,
        dissolve: 0,
        feature: "",
        scan: false,
        scanU: 0,
        modelScale: 1,
        visibility: 1
      });
    }
  }

  function activateState(index, immediate = false) {
    stateIndex = index;
    transitionStamp = performance.now();
    targets = sampleState(index);
    ensureParticleCount(targets.length);

    stateLabel.style.opacity = "0";
    window.setTimeout(() => {
      stateLabel.textContent = states[index].name;
      stateLabel.style.opacity = "1";
    }, reduceMotion ? 0 : 180);

    particles.forEach((particle, i) => {
      const target = targets[i % targets.length] || {
        x: width * 0.5,
        y: height * 0.5,
        color: palette.white,
        size: 1,
        depth: 1,
        char: "0"
      };

      particle.tx = target.x;
      particle.ty = target.y;
      particle.color = target.color;
      particle.baseColor = target.color;
      particle.size = target.size || 1;
      particle.baseSize = target.size || 1;
      particle.depth = target.depth || 1;
      particle.char = target.char || (i % 2 === 0 ? "0" : "1");
      particle.model = target.model || "";
      particle.anchorX = target.anchorX || target.x;
      particle.anchorY = target.anchorY || target.y;
      particle.x3 = target.x3 || 0;
      particle.y3 = target.y3 || 0;
      particle.z3 = target.z3 || 0;
      particle.dissolve = target.dissolve || 0;
      particle.feature = target.feature || "";
      particle.scan = Boolean(target.scan);
      particle.scanU = target.scanU || 0;
      particle.modelScale = target.modelScale || 1;
      particle.visibility = target.visibility == null ? 1 : target.visibility;
      particle.active = i < targets.length;

      if (immediate) {
        particle.x = target.x;
        particle.y = target.y;
        particle.vx = 0;
        particle.vy = 0;
        particle.alpha = particle.active ? particle.baseAlpha : 0;
      }
    });
  }

  function render(now = performance.now()) {
    ctx.clearRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const transitionAge = clamp((now - transitionStamp) / 2200, 0, 1);

    particles.forEach((particle, index) => {
      if (stateIndex === 0 && particle.model === "mediapipeFace") {
        const yaw = Math.sin(now * 0.00028) * 0.42 - 0.06;
        const pitch = Math.cos(now * 0.00019) * 0.065 - 0.02;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);

        let modelX = particle.x3;
        let modelY = particle.y3;
        let modelZ = particle.z3;

        if (particle.scan) {
          const scanProgress = ((now * 0.000085) % 1 + 1) % 1;
          const canonicalY = 7.2 - scanProgress * 15.4;
          const verticalPosition = (canonicalY + 0.676) / 8.6;
          const halfWidth = 7.25 * Math.sqrt(Math.max(0.08, 1 - verticalPosition * verticalPosition));
          const canonicalX = halfWidth * particle.scanU;
          const canonicalZ = 4.6 + (1 - particle.scanU * particle.scanU) * 2.2;
          modelX = canonicalX * particle.modelScale;
          modelY = -(canonicalY + 0.676) * particle.modelScale;
          modelZ = (canonicalZ - 4.159) * particle.modelScale * 1.12 + 10;
        }

        const x1 = modelX * cosY + modelZ * sinY;
        const z1 = modelZ * cosY - modelX * sinY;
        const y1 = modelY * cosX - z1 * sinX;
        const z2 = z1 * cosX + modelY * sinX;
        const perspective = 520 / (520 - z2);

        particle.tx = particle.anchorX + x1 * perspective;
        particle.ty = particle.anchorY + y1 * perspective;
        particle.depth = clamp(0.9 + z2 / 260, 0.58, 1.42);
        particle.size = particle.baseSize * (particle.scan ? 1.16 : (z2 > 0 ? 1.08 : 0.82));
        particle.color = particle.scan ? palette.white : (particle.baseColor || palette.ice);
        particle.visibility = particle.scan
          ? 1
          : clamp(0.34 + (z2 + 130) / 300, 0.26, 1);
      } else if (stateIndex === 1 && particle.model === "earthGeo") {
        const yaw = (now - transitionStamp) * 0.00015 + 0.06;
        const pitch = -0.2;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);

        const x1 = particle.x3 * cosY + particle.z3 * sinY;
        const z1 = particle.z3 * cosY - particle.x3 * sinY;
        const y1 = particle.y3 * cosX - z1 * sinX;
        const z2 = z1 * cosX + particle.y3 * sinX;
        const perspective = 460 / (460 - z2);

        particle.tx = particle.anchorX + x1 * perspective;
        particle.ty = particle.anchorY + y1 * perspective;
        const frontness = clamp((z2 / particle.modelScale + 1) * 0.5, 0, 1);
        particle.depth = clamp(0.78 + frontness * 0.5, 0.72, 1.28);
        particle.size = particle.baseSize * (0.84 + frontness * 0.24);
        particle.color = particle.baseColor || palette.blue;
        if (particle.feature === "atmosphere") {
          particle.visibility = 0.12 + frontness * 0.42;
        } else if (particle.feature === "oceanGrid") {
          particle.visibility = 0.04 + frontness * 0.52;
        } else if (particle.feature === "landFill") {
          particle.visibility = frontness > 0.46 ? frontness * 0.88 : 0.015;
        } else {
          particle.visibility = frontness > 0.43 ? 0.34 + frontness * 0.66 : 0.02;
        }
      } else if (stateIndex === 2 && particle.model === "communityNetwork") {
        const networkPhase = (now - transitionStamp) * 0.00022;
        const yaw = Math.sin(networkPhase) * 0.34 - 0.06;
        const pitch = -0.18 + Math.cos(networkPhase * 0.72) * 0.045;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosX = Math.cos(pitch);
        const sinX = Math.sin(pitch);

        const x1 = particle.x3 * cosY + particle.z3 * sinY;
        const z1 = particle.z3 * cosY - particle.x3 * sinY;
        const y1 = particle.y3 * cosX - z1 * sinX;
        const z2 = z1 * cosX + particle.y3 * sinX;
        const perspective = 520 / (520 - z2);

        particle.tx = particle.anchorX + x1 * perspective;
        particle.ty = particle.anchorY + y1 * perspective;
        const networkFrontness = clamp(0.5 + z2 / (particle.modelScale * 2.2), 0, 1);
        particle.depth = clamp(0.72 + networkFrontness * 0.62, 0.68, 1.34);
        particle.size = particle.baseSize * (0.82 + networkFrontness * 0.28);
        particle.color = particle.baseColor || palette.cyan;
        if (particle.feature === "networkHub") {
          particle.visibility = 0.88 + networkFrontness * 0.12;
        } else if (particle.feature === "networkNode") {
          particle.visibility = 0.58 + networkFrontness * 0.38;
        } else if (particle.feature === "networkHalo") {
          particle.visibility = 0.42 + networkFrontness * 0.32;
        } else if (particle.feature === "networkBridge") {
          particle.visibility = 0.3 + networkFrontness * 0.36;
        } else {
          particle.visibility = 0.12 + networkFrontness * 0.3;
        }
      }

      const spring = reduceMotion ? 1 : (0.038 + particle.depth * 0.014);
      const damping = 0.8;
      const driftX = reduceMotion ? 0 : Math.sin(now * 0.0013 + particle.seed) * 0.18 * particle.depth;
      const driftY = reduceMotion ? 0 : Math.cos(now * 0.001 + particle.seed * 1.2) * 0.18 * particle.depth;

      particle.vx = (particle.vx + (particle.tx + driftX - particle.x) * spring) * damping;
      particle.vy = (particle.vy + (particle.ty + driftY - particle.y) * spring) * damping;
      particle.x += particle.vx;
      particle.y += particle.vy;

      const desiredAlpha = particle.active ? particle.baseAlpha * (0.72 + transitionAge * 0.28) * particle.visibility : 0;
      particle.alpha += (desiredAlpha - particle.alpha) * 0.08;

      if (particle.alpha < 0.02) return;

      const twinkle = reduceMotion ? 1 : (0.92 + Math.sin(now * 0.0022 + particle.seed * 1.5) * 0.08);
      const isFaceMesh = stateIndex === 0 && particle.model === "mediapipeFace";
      const isEarthGlobe = stateIndex === 1 && particle.model === "earthGeo";
      const isNetworkMesh = stateIndex === 2 && particle.model === "communityNetwork";
      const isNetworkConnection = isNetworkMesh && (
        particle.feature === "networkEdge" || particle.feature === "networkBridge"
      );
      let fontSize;
      if (isFaceMesh) {
        fontSize = clamp((width / 144) * particle.depth * particle.size, 5.2, 11.6);
      } else if (isEarthGlobe) {
        fontSize = clamp((width / 154) * particle.depth * particle.size, 5.1, 10.8);
      } else if (isNetworkMesh) {
        if (isNetworkConnection) {
          fontSize = clamp((width / 154) * particle.depth * particle.size, 4.1, 7.2);
        } else if (particle.feature === "networkHub") {
          fontSize = clamp((width / 148) * particle.depth * particle.size, 6.5, 15);
        } else {
          fontSize = clamp((width / 148) * particle.depth * particle.size, 5.2, 12.5);
        }
      } else {
        fontSize = clamp((width / 124) * particle.depth * particle.size, 8.5, 15.5);
      }
      const glyph = particle.char;

      ctx.font = `700 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.globalAlpha = particle.alpha * twinkle;
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = isNetworkConnection
        ? 0.5 + particle.depth
        : ((isFaceMesh || isEarthGlobe || isNetworkMesh)
          ? 1 + particle.depth * 2
          : 8 + particle.depth * 9);
      ctx.shadowColor = particle.color;
      ctx.fillText(glyph, particle.x, particle.y);
    });

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    if (!reduceMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  function startCycle() {
    if (reduceMotion) return;
    window.clearInterval(cycleTimer);
    cycleTimer = window.setInterval(() => {
      activateState((stateIndex + 1) % states.length);
    }, 10400);
  }

  function stopCycle() {
    window.clearInterval(cycleTimer);
    cancelAnimationFrame(animationFrame);
  }

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      setCanvasSize();
      activateState(stateIndex, true);
      render();
    }, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCycle();
    } else if (!reduceMotion) {
      activateState(stateIndex, true);
      render();
      startCycle();
    }
  });

  setCanvasSize();
  activateState(0, true);
  render();
  startCycle();
})();
