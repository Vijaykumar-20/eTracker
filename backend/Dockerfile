# Build stage
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy all files at once to ensure maven wrapper is present
COPY . .

# Ensure the maven wrapper is executable
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
