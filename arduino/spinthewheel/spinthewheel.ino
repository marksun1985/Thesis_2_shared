#include <core.h>
#include <Stepper.h>

const int stepsPerRevolution = 200;  // change this to fit the number of steps per revolution
                                     // for your motor
Stepper myStepper(stepsPerRevolution, 8,9,10,11);            
int stepCount = 0;         // number of steps the motor has taken
boolean isReading = false;
String inputString  = "";
int value;
int gPin = 12;
int fPin = 13;

void setup() {
  // initialize the serial port:
  Serial.begin(9600);
  myStepper.setSpeed(60);
  pinMode(gPin, OUTPUT);
  pinMode(fPin, OUTPUT);
}

void loop() {
  // Recieve data from Node and write it to a String
     if(Serial.available()) {
       
       char inChar = (char)Serial.read();
                  
          if(inChar == 'E'){
            //Stops reading
            isReading = false;
            
            //Convert to int
            value = inputString.toInt();
            Serial.println(value);
            
            if(value == -10) { // google
              digitalWrite(gPin, HIGH);
              delay(50);
              digitalWrite(gPin, LOW);
            } else if(value == -20) { // facebook
              digitalWrite(fPin, HIGH);
              delay(50);
              digitalWrite(fPin, LOW);
            } else {
              // Drive stepper
              myStepper.step(value);
            }
            
            //resets vars            
            isReading = false;
            inputString  = "";
//            value = 0;
          }
       
          if(isReading){
            inputString += inChar;          
          }
           
          if(inChar == 'B'){ // beginReading
             isReading = true;
          }
    }
}

