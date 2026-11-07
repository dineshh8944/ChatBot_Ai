import React from "react";
import "./DoraemonRobot.css";

export default function DoraemonRobot({ mode = "idle" }) {
  // mode can be "idle", "thinking", or "talking"
  const isThinking = mode === "thinking";
  const isTalking = mode === "talking";

  return (
    <div className={`doraemon-container mode-${mode}`} aria-label={`Doraemon robot is ${mode}`}>
      {/* Real Thought Movement / Thought Bubble UI */}
      {isThinking && (
        <div className="thought-cloud-bubble">
          <div className="thought-particles">
            <span className="dot dot-1" />
            <span className="dot dot-2" />
            <span className="dot dot-3" />
          </div>
          <div className="thought-content">
            <div className="gear-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <span className="thought-text">Analyzing...</span>
          </div>
        </div>
      )}

      {/* Main Doraemon Robot Model */}
      <div className="doraemon-figure">
        <svg
          viewBox="0 0 260 285"
          className="doraemon-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bellGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff275" />
              <stop offset="60%" stopColor="#ffd400" />
              <stop offset="100%" stopColor="#d49b00" />
            </radialGradient>
            <radialGradient id="noseGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ff5252" />
              <stop offset="60%" stopColor="#e70012" />
              <stop offset="100%" stopColor="#9e000c" />
            </radialGradient>
            <radialGradient id="blueGrad" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#29b6f6" />
              <stop offset="65%" stopColor="#009ee7" />
              <stop offset="100%" stopColor="#0077ba" />
            </radialGradient>
            <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#1d3557" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Bamboo Copter (Take-copter) */}
          <g className={`take-copter ${isThinking ? "fast-spin" : isTalking ? "medium-spin" : "gentle-spin"}`}>
            {/* Suction mount base */}
            <ellipse cx="130" cy="35" rx="10" ry="3.5" fill="#ffd400" stroke="#1d3557" strokeWidth="2" />
            {/* Stem */}
            <rect x="128" y="16" width="4" height="19" rx="2" fill="#ffd400" stroke="#1d3557" strokeWidth="1.8" />
            {/* Propeller hub */}
            <circle cx="130" cy="16" r="4.5" fill="#f57c00" stroke="#1d3557" strokeWidth="1.8" />
            {/* Spinning propeller blades */}
            <g className="propeller-blades">
              <ellipse cx="130" cy="16" rx="38" ry="4" fill="#ffd400" stroke="#1d3557" strokeWidth="1.8" />
              <circle cx="95" cy="16" r="3" fill="#ffb300" />
              <circle cx="165" cy="16" r="3" fill="#ffb300" />
            </g>
          </g>

          {/* Left Tail behind body */}
          <circle cx="78" cy="208" r="8.5" fill="url(#noseGrad)" stroke="#1d3557" strokeWidth="2.5" />

          {/* Robot Feet */}
          <g className="feet-group">
            <ellipse cx="106" cy="242" rx="20" ry="11" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
            <ellipse cx="154" cy="242" rx="20" ry="11" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
          </g>

          {/* Body */}
          <path
            d="M 94 156 Q 80 216 102 235 L 158 235 Q 180 216 166 156 Z"
            fill="url(#blueGrad)"
            stroke="#1d3557"
            strokeWidth="3.2"
          />

          {/* White Belly */}
          <circle cx="130" cy="195" r="33" fill="#ffffff" stroke="#1d3557" strokeWidth="2.6" />

          {/* 4D Pocket (Half moon pouch) */}
          <g className="pocket-group">
            <path
              d="M 106 193 Q 130 193 154 193 C 154 220 106 220 106 193 Z"
              fill="#ffffff"
              stroke="#1d3557"
              strokeWidth="2.5"
            />
            {/* Pocket opening rim */}
            <line x1="106" y1="193" x2="154" y2="193" stroke="#1d3557" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Left Arm & White Round Hand */}
          <g className={`left-arm ${isTalking ? "talk-gesture" : ""}`}>
            <path d="M 94 165 Q 68 180 64 195" fill="none" stroke="url(#blueGrad)" strokeWidth="18" strokeLinecap="round" />
            <circle cx="60" cy="196" r="14.5" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
          </g>

          {/* Right Arm & White Round Hand */}
          <g className={`right-arm ${isThinking ? "think-pose" : isTalking ? "wave-pose" : "idle-pose"}`}>
            {isThinking ? (
              <>
                {/* Arm raised to chin/head */}
                <path d="M 166 165 Q 188 150 182 125" fill="none" stroke="url(#blueGrad)" strokeWidth="18" strokeLinecap="round" />
                <circle cx="182" cy="120" r="14.5" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
              </>
            ) : isTalking ? (
              <>
                {/* Arm waving cheerfully */}
                <path d="M 166 165 Q 192 165 200 150" fill="none" stroke="url(#blueGrad)" strokeWidth="18" strokeLinecap="round" />
                <circle cx="204" cy="148" r="14.5" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
              </>
            ) : (
              <>
                {/* Arm resting at side */}
                <path d="M 166 165 Q 192 180 196 195" fill="none" stroke="url(#blueGrad)" strokeWidth="18" strokeLinecap="round" />
                <circle cx="200" cy="196" r="14.5" fill="#ffffff" stroke="#1d3557" strokeWidth="2.8" />
              </>
            )}
          </g>

          {/* Head Group */}
          <g className="head-group" filter="url(#shadowFilter)">
            {/* Outer Blue Head */}
            <circle cx="130" cy="98" r="64" fill="url(#blueGrad)" stroke="#1d3557" strokeWidth="3.4" />

            {/* Inner White Face */}
            <ellipse cx="130" cy="108" rx="53" ry="44" fill="#ffffff" stroke="#1d3557" strokeWidth="3" />

            {/* Whiskers (3 on left, 3 on right) */}
            <g className="whiskers" stroke="#1d3557" strokeWidth="2.5" strokeLinecap="round">
              {/* Left Whiskers */}
              <line x1="116" y1="99" x2="74" y2="93" />
              <line x1="116" y1="107" x2="70" y2="107" />
              <line x1="116" y1="115" x2="74" y2="121" />

              {/* Right Whiskers */}
              <line x1="144" y1="99" x2="186" y2="93" />
              <line x1="144" y1="107" x2="190" y2="107" />
              <line x1="144" y1="115" x2="186" y2="121" />
            </g>

            {/* Eyes */}
            <g className={`eyes-group ${isThinking ? "thinking-eyes" : isTalking ? "talking-eyes" : "idle-eyes"}`}>
              {/* Left Eye Sclera */}
              <ellipse cx="115" cy="71" rx="14.5" ry="19" fill="#ffffff" stroke="#1d3557" strokeWidth="3" />
              {/* Right Eye Sclera */}
              <ellipse cx="145" cy="71" rx="14.5" ry="19" fill="#ffffff" stroke="#1d3557" strokeWidth="3" />

              {/* Pupils */}
              {isThinking ? (
                <>
                  {/* Looking up thoughtfully */}
                  <g className="pupils-thinking">
                    <circle cx="117" cy="62" r="5.2" fill="#1d3557" />
                    <circle cx="119" cy="60" r="1.8" fill="#ffffff" />
                    <circle cx="147" cy="62" r="5.2" fill="#1d3557" />
                    <circle cx="149" cy="60" r="1.8" fill="#ffffff" />
                  </g>
                </>
              ) : isTalking ? (
                <>
                  {/* Happy twinkling pupils */}
                  <g className="pupils-talking">
                    <circle cx="118" cy="73" r="5.5" fill="#1d3557" />
                    <circle cx="120" cy="70.5" r="2" fill="#ffffff" />
                    <circle cx="142" cy="73" r="5.5" fill="#1d3557" />
                    <circle cx="144" cy="70.5" r="2" fill="#ffffff" />
                  </g>
                </>
              ) : (
                <>
                  {/* Natural idle pupils with blink capability */}
                  <g className="pupils-idle">
                    <circle cx="119" cy="73" r="5.2" fill="#1d3557" />
                    <circle cx="120.5" cy="71" r="1.8" fill="#ffffff" />
                    <circle cx="141" cy="73" r="5.2" fill="#1d3557" />
                    <circle cx="142.5" cy="71" r="1.8" fill="#ffffff" />
                  </g>
                </>
              )}
            </g>

            {/* Red Nose with shine */}
            <circle cx="130" cy="92" r="9" fill="url(#noseGrad)" stroke="#1d3557" strokeWidth="2.5" />
            <circle cx="127" cy="89" r="2.8" fill="#ffffff" />

            {/* Vertical Philtrum Line */}
            <line x1="130" y1="101" x2="130" y2="126" stroke="#1d3557" strokeWidth="2.6" strokeLinecap="round" />

            {/* Mouth */}
            <g className="mouth-group">
              {isTalking ? (
                /* Animated Open Cheerful Speaking Mouth */
                <g className="mouth-talking-anim">
                  <path
                    d="M 104 125 Q 130 162 156 125 C 150 120 110 120 104 125 Z"
                    fill="#e70012"
                    stroke="#1d3557"
                    strokeWidth="2.6"
                    strokeLinejoin="round"
                  />
                  {/* Tongue */}
                  <path
                    d="M 115 142 Q 130 134 145 142 Q 130 156 115 142 Z"
                    fill="#ff88a3"
                    stroke="#1d3557"
                    strokeWidth="1.6"
                  />
                </g>
              ) : isThinking ? (
                /* Thoughtful subtle "O" mouth */
                <ellipse cx="130" cy="130" rx="6.5" ry="5" fill="#e70012" stroke="#1d3557" strokeWidth="2.4" />
              ) : (
                /* Warm Smiling Mouth */
                <path
                  d="M 102 126 Q 130 148 158 126"
                  fill="none"
                  stroke="#1d3557"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>

          {/* Red Collar */}
          <rect x="94" y="152" width="72" height="12" rx="6" fill="url(#noseGrad)" stroke="#1d3557" strokeWidth="3" />

          {/* Golden Bell with Jingle movement */}
          <g className={`bell-group ${isTalking ? "bell-jingle" : ""}`}>
            <circle cx="130" cy="165" r="11.5" fill="url(#bellGrad)" stroke="#1d3557" strokeWidth="2.4" />
            {/* Bell horizontal line */}
            <line x1="119" y1="162" x2="141" y2="162" stroke="#7c5e00" strokeWidth="2" strokeLinecap="round" />
            <line x1="120" y1="165" x2="140" y2="165" stroke="#7c5e00" strokeWidth="1.5" strokeLinecap="round" />
            {/* Bell center hole & slit */}
            <circle cx="130" cy="169" r="2.6" fill="#1d3557" />
            <line x1="130" y1="171" x2="130" y2="176" stroke="#1d3557" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>

        {/* Soft floating ground shadow */}
        <div className="floating-shadow" />
      </div>
    </div>
  );
}
