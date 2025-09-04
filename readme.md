%% Use Case Diagram for MediClue - Disease Symptom Checker
usecaseDiagram
  actor User as U
  actor Admin as A
  actor "ML Model" as ML
  actor "MongoDB Database" as DB

  U --> (Register / Login)
  U --> (Enter Symptoms)
  U --> (View Predicted Disease)
  U --> (View Suggested Treatments)
  U --> (View Past Results)

  (Enter Symptoms) --> ML
  (View Predicted Disease) --> ML
  (View Suggested Treatments) --> DB
  (View Past Results) --> DB

  A --> (Manage Users)
  A --> (Manage Symptoms Dataset)
  A --> (Manage Disease Information)
  A --> (Monitor System)

  (Manage Symptoms Dataset) --> DB
  (Manage Disease Information) --> DB
