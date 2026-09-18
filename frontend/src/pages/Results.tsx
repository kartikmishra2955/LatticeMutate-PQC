import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/Table"
import { Badge } from "../components/ui/Badge"
import { Button } from "../components/ui/Button"
import { recentResults } from "../data/mockData"
import { Download } from "lucide-react"

export function Results() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Experiment Results</h2>
          <p className="text-gray-500 mt-2 text-sm font-mono">
            Dataset: EXP-8472 | ML-KEM-768 | Baseline Security: 195.0 bits
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mutation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mutation</TableHead>
                <TableHead>Parameter</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Security Estimate</TableHead>
                <TableHead>Correctness</TableHead>
                <TableHead>KeyGen</TableHead>
                <TableHead>Encap</TableHead>
                <TableHead>Decap</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-mono text-xs">{result.id}</TableCell>
                  <TableCell className="font-mono">{result.parameter}</TableCell>
                  <TableCell>{result.change}</TableCell>
                  <TableCell>
                    <span className={result.regression ? "text-red-600 font-medium" : ""}>
                      {result.securityEstimate}
                    </span>
                  </TableCell>
                  <TableCell>
                    {result.correctness === "100%" ? (
                      <span className="text-green-600">{result.correctness}</span>
                    ) : (
                      <Badge variant="danger">{result.correctness}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{result.keyGen}</TableCell>
                  <TableCell>{result.encapsulation}</TableCell>
                  <TableCell>{result.decapsulation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
