import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Sparkles, ArrowRight } from "lucide-react"

export function Analysis() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Research Interpretation</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Structured comparative analysis of baseline and mutated configurations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Baseline vs Mutated (EXP-8472)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 border-b pb-2">Observations</h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500 mt-0.5">•</span>
                      <span>Negative perturbation of parameter q by 10% (3329 → 2996) was associated with a decrease in estimated security by 22.5 bits.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500 mt-0.5">•</span>
                      <span>This same perturbation resulted in a measurable correctness degradation, reducing successful decapsulations from 100% to 94.2%.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-500 mt-0.5">•</span>
                      <span>Positive perturbation of parameter η1 (+50%) did not induce correctness failures but was observed to marginally increase encapsulation execution time (+0.05ms).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="h-full bg-[#fafafa]">
            <CardHeader className="pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm">Research Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs text-gray-500 mb-4">
                Select an action to interpret the structured experimental data.
              </p>
              
              <Button variant="outline" className="w-full justify-between font-normal text-left text-xs h-auto py-2.5">
                <span>Explain this result</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-between font-normal text-left text-xs h-auto py-2.5">
                <span>Identify unusual observations</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-between font-normal text-left text-xs h-auto py-2.5">
                <span>Suggest follow-up experiments</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Button>
              <Button variant="outline" className="w-full justify-between font-normal text-left text-xs h-auto py-2.5">
                <span>Draft discussion paragraph</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </Button>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-[10px] text-gray-400 text-center leading-tight">
                  Assistant uses only deterministic data from the experiment. It does not invent results or cryptographic parameters.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
