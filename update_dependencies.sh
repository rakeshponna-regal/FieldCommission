#!/bin/bash

# Navigate to the IOS directory of your React Native project
nodeModulesDir="node_modules/"
grep -rl "s.dependency 'React/Core'" "$nodeModulesDir" | xargs sed -i '' 's=React/Core=React-Core=g'

# Navigate to the Android directory of your React Native project
 cd android
 
buildGradleFiles=(
    "../node_modules/react-native-fetch-blob/android/build.gradle"
    # Add more paths if needed
)
newCompileSdkVersion=34
newBuildToolsVersion="34.0.0"
newTargetSdkVersion=34

# Use sed to replace the compileSdkVersion, buildToolsVersion, and targetSdkVersion in the file
    sed -i.bak "s/compileSdkVersion [0-9]*/compileSdkVersion $newCompileSdkVersion/" "$buildGradleFiles" && rm "${buildGradleFiles}.bak"
    sed -i.bak "s/buildToolsVersion \"[^\"]*\"/buildToolsVersion \"$newBuildToolsVersion\"/" "$buildGradleFiles" && rm "${buildGradleFiles}.bak"
    sed -i.bak "s/targetSdkVersion [0-9]*/targetSdkVersion $newTargetSdkVersion/" "$buildGradleFiles" && rm "${buildGradleFiles}.bak"
# Replace "compile" with "implementation" in the specified files
for file in "${buildGradleFiles[@]}"; do
    sed -i.bak 's/compile /implementation /g' "$file" && rm "${file}.bak"
   
done
cd ..


