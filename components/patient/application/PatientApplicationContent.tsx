"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Star, Shield, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your medical data is encrypted and secure",
    color: "bg-green-500",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Quick access to your medical information",
    color: "bg-yellow-500",
  },
  {
    icon: Users,
    title: "Connect with Doctors",
    description: "Easy communication with healthcare providers",
    color: "bg-blue-500",
  },
];

export function PatientApplicationContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-pink-500">DOKTOR Mobile App</h1>
          <p className="text-gray-600">Download our mobile application for better experience</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-gray-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - App Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">D</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">DOKTOR</h2>
                  <p className="text-gray-500">Medical Info Anytime</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">4.8 (2.1k reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Download Now</h3>
              <div className="flex flex-col space-y-3">
                <Button className="bg-black hover:bg-gray-800 text-white h-14 rounded-xl flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </Button>

                <Button className="bg-black hover:bg-gray-800 text-white h-14 rounded-xl flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-300">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-64 h-[500px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 relative shadow-2xl">
                {/* Screen */}
                <div className="bg-white rounded-[2rem] m-2 relative overflow-hidden h-[calc(100%-16px)]">
                  {/* Status Bar */}
                  <div className="h-8 bg-gray-100 flex items-center justify-between px-6">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                      <div className="w-6 h-3 border border-gray-400 rounded-sm">
                        <div className="w-4 h-2 bg-green-500 rounded-sm m-0.5"></div>
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <span className="text-white font-bold">D</span>
                      </div>
                      <h3 className="font-bold text-blue-600">DOKTOR</h3>
                      <p className="text-xs text-gray-500">MEDICAL INFO ANYTIME</p>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="space-y-3">
                      <div className="bg-blue-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-blue-100">Next Appointment</p>
                            <p className="font-semibold">Dr. Michael Brown</p>
                            <p className="text-xs">Tomorrow, 2:00 PM</p>
                          </div>
                          <Calendar className="w-6 h-6 text-blue-200" />
                        </div>
                      </div>

                      <div className="bg-pink-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-pink-100">Medications</p>
                            <p className="font-semibold">2 pending</p>
                            <p className="text-xs">Take before breakfast</p>
                          </div>
                          <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                        </div>
                      </div>

                      <div className="bg-green-500 rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-green-100">Health Status</p>
                            <p className="font-semibold">All Good</p>
                            <p className="text-xs">Last check: 2 days ago</p>
                          </div>
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-400 rounded-full opacity-80"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full opacity-80"></div>
              <div className="absolute top-1/2 -left-6 w-4 h-4 bg-purple-400 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>

        {/* App Description */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Take Your Health Management On The Go
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Access your medical records, communicate with doctors, manage appointments, 
            and track your medications all from your mobile device. Stay connected to 
            your healthcare wherever you are.
          </p>
        </div>
      </div>
    </div>
  );
}